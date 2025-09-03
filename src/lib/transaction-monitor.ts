import { prisma } from './prisma'
import { getTransactionStatus, STACKS_API_URL, getCurrentBlockHeight } from './stacks'

export interface TransactionMonitorConfig {
  confirmationThreshold: number
  maxRetries: number
  retryInterval: number // milliseconds
  webhookUrl?: string
  onStatusUpdate?: (txId: string, status: any) => void
}

export class TransactionMonitor {
  private config: TransactionMonitorConfig
  private monitoring: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: Partial<TransactionMonitorConfig> = {}) {
    this.config = {
      confirmationThreshold: 1,
      maxRetries: 120, // 10 minutes with 5s intervals
      retryInterval: 5000,
      ...config
    }
  }

  async startMonitoring(txId: string, paymentId?: string): Promise<void> {
    if (this.monitoring.has(txId)) {
      console.log(`Already monitoring transaction ${txId}`)
      return
    }

    console.log(`Starting to monitor transaction ${txId}`)
    
    // Store transaction in database
    await this.storeTransaction(txId)
    
    let attempts = 0
    const monitor = async () => {
      try {
        attempts++
        const status = await getTransactionStatus(txId)
        
        await this.updateTransactionStatus(txId, status)
        this.config.onStatusUpdate?.(txId, status)
        
        if (status.tx_status === 'success') {
          const confirmations = await this.getConfirmations(status.block_height)
          
          if (confirmations >= this.config.confirmationThreshold) {
            console.log(`Transaction ${txId} confirmed with ${confirmations} confirmations`)
            await this.handleConfirmedTransaction(txId, paymentId)
            this.stopMonitoring(txId)
            return
          } else {
            console.log(`Transaction ${txId} needs more confirmations: ${confirmations}/${this.config.confirmationThreshold}`)
          }
        } else if (status.tx_status === 'abort_by_post_condition' || status.tx_status === 'abort_by_response') {
          console.log(`Transaction ${txId} failed: ${status.tx_status}`)
          await this.handleFailedTransaction(txId, paymentId, status.tx_status)
          this.stopMonitoring(txId)
          return
        }
        
        if (attempts >= this.config.maxRetries) {
          console.log(`Transaction ${txId} monitoring timeout after ${attempts} attempts`)
          await this.handleTimeoutTransaction(txId, paymentId)
          this.stopMonitoring(txId)
          return
        }
        
        // Schedule next check
        const timeoutId = setTimeout(monitor, this.config.retryInterval)
        this.monitoring.set(txId, timeoutId)
        
      } catch (error) {
        console.error(`Error monitoring transaction ${txId}:`, error)
        
        if (attempts >= this.config.maxRetries) {
          await this.handleTimeoutTransaction(txId, paymentId)
          this.stopMonitoring(txId)
          return
        }
        
        // Retry on error
        const timeoutId = setTimeout(monitor, this.config.retryInterval)
        this.monitoring.set(txId, timeoutId)
      }
    }
    
    // Start monitoring
    const timeoutId = setTimeout(monitor, 1000) // Start after 1 second
    this.monitoring.set(txId, timeoutId)
  }

  stopMonitoring(txId: string): void {
    const timeoutId = this.monitoring.get(txId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.monitoring.delete(txId)
      console.log(`Stopped monitoring transaction ${txId}`)
    }
  }

  stopAll(): void {
    const txIds = Array.from(this.monitoring.keys())
    for (const txId of txIds) {
      this.stopMonitoring(txId)
    }
  }

  private async storeTransaction(txId: string): Promise<void> {
    try {
      await prisma.transaction.upsert({
        where: { txId },
        update: {
          updatedAt: new Date()
        },
        create: {
          txId,
          status: 'PENDING',
          amount: 0, // Will be updated when we get transaction details
          fromAddress: '',
          toAddress: '',
        }
      })
    } catch (error) {
      console.error(`Error storing transaction ${txId}:`, error)
    }
  }

  private async updateTransactionStatus(txId: string, status: any): Promise<void> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
        rawTxData: status,
      }

      if (status.tx_status === 'success') {
        updateData.status = 'CONFIRMED'
        updateData.blockHeight = BigInt(status.block_height || 0)
        updateData.confirmations = await this.getConfirmations(status.block_height)
      } else if (status.tx_status === 'abort_by_post_condition' || status.tx_status === 'abort_by_response') {
        updateData.status = 'FAILED'
      }

      // Extract transaction details if available
      if (status.tx_result && status.token_transfer) {
        updateData.amount = parseFloat(status.token_transfer.amount || '0')
        updateData.fromAddress = status.sender_address
        updateData.toAddress = status.token_transfer.recipient_address
      }

      await prisma.transaction.upsert({
        where: { txId },
        update: updateData,
        create: {
          txId,
          status: updateData.status || 'PENDING',
          amount: updateData.amount || 0,
          fromAddress: updateData.fromAddress || '',
          toAddress: updateData.toAddress || '',
          blockHeight: updateData.blockHeight,
          confirmations: updateData.confirmations || 0,
          rawTxData: updateData.rawTxData,
        }
      })
    } catch (error) {
      console.error(`Error updating transaction status for ${txId}:`, error)
    }
  }

  private async getConfirmations(blockHeight?: number): Promise<number> {
    if (!blockHeight) return 0
    
    try {
      const currentHeight = await getCurrentBlockHeight()
      return Math.max(0, currentHeight - blockHeight + 1)
    } catch (error) {
      console.error('Error getting confirmations:', error)
      return 0
    }
  }

  private async handleConfirmedTransaction(txId: string, paymentId?: string): Promise<void> {
    try {
      // Update payment status if paymentId provided
      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            confirmations: this.config.confirmationThreshold,
          }
        })
        
        // Update user earnings
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: { user: true }
        })
        
        if (payment?.user) {
          await prisma.user.update({
            where: { id: payment.userId! },
            data: {
              totalEarnings: { increment: payment.netAmount },
              totalPayments: { increment: 1 },
            }
          })
        }
      }
      
      // Send webhook notification if configured
      if (this.config.webhookUrl) {
        await this.sendWebhook(txId, 'confirmed', { paymentId })
      }
      
      console.log(`Successfully handled confirmed transaction ${txId}`)
    } catch (error) {
      console.error(`Error handling confirmed transaction ${txId}:`, error)
    }
  }

  private async handleFailedTransaction(txId: string, paymentId?: string, reason?: string): Promise<void> {
    try {
      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'FAILED',
            metadata: {
              failureReason: reason,
              failedAt: new Date().toISOString(),
            }
          }
        })
      }
      
      if (this.config.webhookUrl) {
        await this.sendWebhook(txId, 'failed', { paymentId, reason })
      }
      
      console.log(`Handled failed transaction ${txId}: ${reason}`)
    } catch (error) {
      console.error(`Error handling failed transaction ${txId}:`, error)
    }
  }

  private async handleTimeoutTransaction(txId: string, paymentId?: string): Promise<void> {
    try {
      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'EXPIRED',
            metadata: {
              timeoutAt: new Date().toISOString(),
            }
          }
        })
      }
      
      if (this.config.webhookUrl) {
        await this.sendWebhook(txId, 'timeout', { paymentId })
      }
      
      console.log(`Handled timeout transaction ${txId}`)
    } catch (error) {
      console.error(`Error handling timeout transaction ${txId}:`, error)
    }
  }

  private async sendWebhook(txId: string, event: string, data: any): Promise<void> {
    if (!this.config.webhookUrl) return
    
    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ZapX-TransactionMonitor/1.0',
        },
        body: JSON.stringify({
          event,
          txId,
          timestamp: new Date().toISOString(),
          data,
        })
      })
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }
      
      console.log(`Webhook sent for ${txId}: ${event}`)
    } catch (error) {
      console.error(`Error sending webhook for ${txId}:`, error)
    }
  }

  // Static method to create a global monitor instance
  static create(config?: Partial<TransactionMonitorConfig>): TransactionMonitor {
    return new TransactionMonitor(config)
  }
}

// Global monitor instance
export const transactionMonitor = TransactionMonitor.create()

// Cleanup on process exit
process.on('SIGTERM', () => {
  transactionMonitor.stopAll()
})

process.on('SIGINT', () => {
  transactionMonitor.stopAll()
  process.exit(0)
})