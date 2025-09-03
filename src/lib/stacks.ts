import { 
  openContractCall, 
  openSTXTransfer, 
  showConnect, 
  disconnect,
  AppConfig,
  UserSession 
} from '@stacks/connect'
import { 
  StacksTestnet, 
  StacksMainnet,
  StacksNetwork 
} from '@stacks/network'
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  createAssetInfo,
  makeStandardSTXPostCondition,
  makeContractSTXPostCondition,
  FungibleConditionCode,
  Pc,
} from '@stacks/transactions'
import { 
  principalCV, 
  uintCV, 
  stringAsciiCV, 
  contractPrincipalCV,
  standardPrincipalCV 
} from '@stacks/transactions'

// Network configuration
export const getStacksNetwork = (): StacksNetwork => {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet'
  return networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet()
}

export const STACKS_API_URL = process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so'

// sBTC token configuration (testnet)
export const SBTC_CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
export const SBTC_CONTRACT_NAME = 'sbtc-token'

// Helper functions for sBTC amounts (8 decimal places like Bitcoin)
export const formatSBTC = (satoshis: number): string => {
  return (satoshis / 100000000).toFixed(8)
}

export const parseSBTC = (amount: string): number => {
  return Math.round(parseFloat(amount) * 100000000)
}

export const sbtcToSatoshis = (sbtc: number): number => {
  return Math.round(sbtc * 100000000)
}

export const satoshisToSBTC = (satoshis: number): number => {
  return satoshis / 100000000
}

// STX helper functions
export const microSTXToSTX = (microSTX: number): number => {
  return microSTX / 1000000
}

export const STXToMicroSTX = (stx: number): number => {
  return Math.round(stx * 1000000)
}

// Enhanced sBTC transfer function
export interface SBTCTransferParams {
  recipientAddress: string
  amount: number // in satoshis
  memo?: string
  onFinish?: (data: any) => void
  onCancel?: () => void
}

export const transferSBTC = async ({
  recipientAddress,
  amount,
  memo,
  onFinish,
  onCancel,
}: SBTCTransferParams) => {
  const network = getStacksNetwork()
  const senderAddress = getUserAddress()
  
  if (!senderAddress) {
    throw new Error('No wallet connected')
  }

  const functionArgs = [
    uintCV(amount),
    standardPrincipalCV(senderAddress),
    standardPrincipalCV(recipientAddress),
    memo ? stringAsciiCV(memo) : stringAsciiCV('ZapX Payment'),
  ]

  // Create post conditions to ensure the sender has enough sBTC
  const postConditions = [
    makeContractSTXPostCondition(
      SBTC_CONTRACT_ADDRESS,
      SBTC_CONTRACT_NAME,
      FungibleConditionCode.Equal,
      amount
    ),
  ]

  const txOptions = {
    contractAddress: SBTC_CONTRACT_ADDRESS,
    contractName: SBTC_CONTRACT_NAME,
    functionName: 'transfer',
    functionArgs,
    network,
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
    onFinish,
    onCancel,
  }

  try {
    await openContractCall(txOptions)
  } catch (error) {
    console.error('Error transferring sBTC:', error)
    throw error
  }
}

// STX transfer function for fallback
export interface STXTransferParams {
  recipientAddress: string
  amount: number // in microSTX
  memo?: string
  onFinish?: (data: any) => void
  onCancel?: () => void
}

export const transferSTX = async ({
  recipientAddress,
  amount,
  memo,
  onFinish,
  onCancel,
}: STXTransferParams) => {
  const network = getStacksNetwork()

  const txOptions = {
    recipient: recipientAddress,
    amount: BigInt(amount),
    memo: memo || 'ZapX Payment',
    network,
    anchorMode: AnchorMode.Any,
    onFinish,
    onCancel,
  }

  try {
    await openSTXTransfer(txOptions)
  } catch (error) {
    console.error('Error transferring STX:', error)
    throw error
  }
}

// Get transaction status with retries
export const getTransactionStatus = async (txId: string, maxRetries = 5) => {
  let retries = 0
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(`${STACKS_API_URL}/extended/v1/tx/${txId}`)
      
      if (response.ok) {
        return await response.json()
      }
      
      if (response.status === 404 && retries < maxRetries - 1) {
        // Transaction might not be in mempool yet, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000))
        retries++
        continue
      }
      
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      if (retries === maxRetries - 1) {
        console.error('Error fetching transaction status:', error)
        throw error
      }
      retries++
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

// Monitor transaction confirmations
export const monitorTransaction = async (
  txId: string,
  onUpdate: (status: any) => void,
  requiredConfirmations = 1
) => {
  let confirmed = false
  let attempts = 0
  const maxAttempts = 120 // 10 minutes with 5s intervals

  while (!confirmed && attempts < maxAttempts) {
    try {
      const status = await getTransactionStatus(txId)
      onUpdate(status)

      if (status.tx_status === 'success') {
        const confirmations = status.confirmations || 0
        if (confirmations >= requiredConfirmations) {
          confirmed = true
          return status
        }
      } else if (status.tx_status === 'abort_by_post_condition' || status.tx_status === 'abort_by_response') {
        throw new Error(`Transaction failed: ${status.tx_status}`)
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, 5000))
    } catch (error) {
      console.error('Error monitoring transaction:', error)
      if (attempts >= maxAttempts - 1) {
        throw error
      }
      attempts++
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  if (!confirmed) {
    throw new Error('Transaction confirmation timeout')
  }
}

// Get account balance
export const getAccountBalance = async (address: string) => {
  try {
    const response = await fetch(`${STACKS_API_URL}/extended/v1/address/${address}/balances`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching account balance:', error)
    throw error
  }
}

// Get sBTC balance
export const getSBTCBalance = async (address: string): Promise<number> => {
  try {
    const balances = await getAccountBalance(address)
    
    // Look for sBTC token balance in fungible tokens
    const sbtcTokenId = `${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}::sbtc`
    const sbtcBalance = balances.fungible_tokens?.[sbtcTokenId]
    
    return sbtcBalance ? parseInt(sbtcBalance.balance) : 0
  } catch (error) {
    console.error('Error fetching sBTC balance:', error)
    return 0
  }
}

// Get STX balance
export const getSTXBalance = async (address: string): Promise<number> => {
  try {
    const balances = await getAccountBalance(address)
    return parseInt(balances.stx.balance) || 0
  } catch (error) {
    console.error('Error fetching STX balance:', error)
    return 0
  }
}

// Price conversion utilities
export const convertSBTCToUSD = async (sbtcAmount: number): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    if (!response.ok) throw new Error('Price API error')
    
    const data = await response.json()
    const btcPrice = data.bitcoin.usd
    
    return sbtcAmount * btcPrice
  } catch (error) {
    console.error('Error converting sBTC to USD:', error)
    return sbtcAmount * 50000 // Fallback price
  }
}

export const convertUSDToSBTC = async (usdAmount: number): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    if (!response.ok) throw new Error('Price API error')
    
    const data = await response.json()
    const btcPrice = data.bitcoin.usd
    
    return usdAmount / btcPrice
  } catch (error) {
    console.error('Error converting USD to sBTC:', error)
    return usdAmount / 50000 // Fallback price
  }
}

// App configuration for Stacks Connect with Leather wallet preference
const appConfig = new AppConfig(['store_write', 'publish_data'])
export const userSession = new UserSession({ appConfig })

export const appDetails = {
  name: 'ZapX - sBTC Payment Links',
  icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : '',
}

// Enhanced wallet connection with Leather wallet preference
export const connectWallet = () => {
  showConnect({
    appDetails,
    redirectTo: '/',
    onFinish: () => {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    },
    userSession,
    authOrigin: typeof window !== 'undefined' ? window.location.origin : '',
  })
}

export const disconnectWallet = () => {
  disconnect()
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

// Check if user is authenticated
export const isUserSignedIn = () => {
  return userSession.isUserSignedIn()
}

// Get user data
export const getUserData = () => {
  if (!userSession.isUserSignedIn()) {
    return null
  }
  return userSession.loadUserData()
}

// Get user's Stacks address
export const getUserAddress = () => {
  const userData = getUserData()
  return userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet
}

// Contract call helpers
export const callReadOnlyFunction = async (
  functionName: string,
  functionArgs: any[] = [],
  contractAddress: string = SBTC_CONTRACT_ADDRESS,
  contractName: string = SBTC_CONTRACT_NAME
) => {
  const network = getStacksNetwork()
  
  try {
    const response = await fetch(`${STACKS_API_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: contractAddress,
        arguments: functionArgs.map(arg => arg.serialize().toString('hex')),
      }),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error calling read-only function:', error)
    throw error
  }
}

// Validate Stacks address
export const isValidStacksAddress = (address: string): boolean => {
  // Simple validation for Stacks addresses
  return /^S[TM][0-9A-Z]{39}$/.test(address)
}

// Get current block height
export const getCurrentBlockHeight = async (): Promise<number> => {
  try {
    const response = await fetch(`${STACKS_API_URL}/extended/v1/block`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const data = await response.json()
    return data.results[0]?.height || 0
  } catch (error) {
    console.error('Error fetching block height:', error)
    return 0
  }
}