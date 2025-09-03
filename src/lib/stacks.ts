import { openContractCall, openSTXTransfer } from '@stacks/connect'
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
  FungibleConditionCode,
} from '@stacks/transactions'
import { principalCV, uintCV, stringAsciiCV, contractPrincipalCV } from '@stacks/transactions'

// Network configuration
export const getStacksNetwork = (): StacksNetwork => {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet'
  return networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet()
}

export const STACKS_API_URL = process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so'

// Contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
export const CONTRACT_NAME = 'sbtc-marketplace'

// sBTC token configuration (testnet)
export const SBTC_CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
export const SBTC_CONTRACT_NAME = 'sbtc-token'

// Helper function to format microSTX to STX
export const microSTXToSTX = (microSTX: number): number => {
  return microSTX / 1000000
}

// Helper function to format STX to microSTX
export const STXToMicroSTX = (stx: number): number => {
  return Math.round(stx * 1000000)
}

// Helper function to format sBTC amount (8 decimal places)
export const formatSBTC = (amount: number): string => {
  return (amount / 100000000).toFixed(8)
}

// Helper function to parse sBTC amount
export const parseSBTC = (amount: string): number => {
  return Math.round(parseFloat(amount) * 100000000)
}

// Create payment transaction
export interface CreatePaymentParams {
  recipientAddress: string
  amount: number // in satoshis (1/100,000,000 sBTC)
  productId: string
  buyerAddress: string
  onFinish?: (data: any) => void
  onCancel?: () => void
}

export const createPayment = async ({
  recipientAddress,
  amount,
  productId,
  buyerAddress,
  onFinish,
  onCancel,
}: CreatePaymentParams) => {
  const network = getStacksNetwork()
  
  const functionArgs = [
    contractPrincipalCV(SBTC_CONTRACT_ADDRESS, SBTC_CONTRACT_NAME),
    uintCV(amount),
    principalCV(recipientAddress),
    stringAsciiCV(productId),
  ]

  const postConditions = [
    makeStandardSTXPostCondition(
      buyerAddress,
      FungibleConditionCode.LessEqual,
      amount
    ),
  ]

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-payment',
    functionArgs,
    network,
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
    onFinish,
    onCancel,
  }

  await openContractCall(txOptions)
}

// Complete payment transaction
export interface CompletePaymentParams {
  paymentId: string
  buyerAddress: string
  onFinish?: (data: any) => void
  onCancel?: () => void
}

export const completePayment = async ({
  paymentId,
  buyerAddress,
  onFinish,
  onCancel,
}: CompletePaymentParams) => {
  const network = getStacksNetwork()
  
  const functionArgs = [
    uintCV(parseInt(paymentId)),
  ]

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'complete-payment',
    functionArgs,
    network,
    anchorMode: AnchorMode.Any,
    onFinish,
    onCancel,
  }

  await openContractCall(txOptions)
}

// Refund payment transaction
export interface RefundPaymentParams {
  paymentId: string
  sellerAddress: string
  onFinish?: (data: any) => void
  onCancel?: () => void
}

export const refundPayment = async ({
  paymentId,
  sellerAddress,
  onFinish,
  onCancel,
}: RefundPaymentParams) => {
  const network = getStacksNetwork()
  
  const functionArgs = [
    uintCV(parseInt(paymentId)),
  ]

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'refund-payment',
    functionArgs,
    network,
    anchorMode: AnchorMode.Any,
    onFinish,
    onCancel,
  }

  await openContractCall(txOptions)
}

// Get transaction status
export const getTransactionStatus = async (txId: string) => {
  try {
    const response = await fetch(`${STACKS_API_URL}/extended/v1/tx/${txId}`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching transaction status:', error)
    throw error
  }
}

// Get account balance
export const getAccountBalance = async (address: string) => {
  try {
    const response = await fetch(`${STACKS_API_URL}/extended/v1/address/${address}/balances`)
    return await response.json()
  } catch (error) {
    console.error('Error fetching account balance:', error)
    throw error
  }
}

// Get sBTC balance
export const getSBTCBalance = async (address: string) => {
  try {
    const response = await fetch(
      `${STACKS_API_URL}/extended/v1/address/${address}/balances`
    )
    const data = await response.json()
    
    // Look for sBTC token balance
    const sbtcBalance = data.fungible_tokens?.[`${SBTC_CONTRACT_ADDRESS}.${SBTC_CONTRACT_NAME}::sbtc`]
    return sbtcBalance ? parseInt(sbtcBalance.balance) : 0
  } catch (error) {
    console.error('Error fetching sBTC balance:', error)
    return 0
  }
}

// Price conversion utilities
export const convertSBTCToUSD = async (sbtcAmount: number): Promise<number> => {
  try {
    // In a real implementation, you would fetch the current sBTC/BTC rate
    // and BTC/USD rate from an API like CoinGecko or CoinMarketCap
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    const data = await response.json()
    const btcPrice = data.bitcoin.usd
    
    // Assuming 1 sBTC = 1 BTC for simplicity
    // In reality, there might be slight differences
    return sbtcAmount * btcPrice
  } catch (error) {
    console.error('Error converting sBTC to USD:', error)
    // Fallback price if API fails
    return sbtcAmount * 45000
  }
}

export const convertUSDToSBTC = async (usdAmount: number): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    const data = await response.json()
    const btcPrice = data.bitcoin.usd
    
    return usdAmount / btcPrice
  } catch (error) {
    console.error('Error converting USD to sBTC:', error)
    // Fallback price if API fails
    return usdAmount / 45000
  }
}

// Wallet connection helpers
export const connectWallet = async () => {
  try {
    // This will be handled by Stacks Connect UI
    // The actual wallet connection is managed by the Stacks Connect library
    return true
  } catch (error) {
    console.error('Error connecting wallet:', error)
    return false
  }
}

// Contract call helpers
export const callReadOnlyFunction = async (
  functionName: string,
  functionArgs: any[] = [],
  contractAddress: string = CONTRACT_ADDRESS,
  contractName: string = CONTRACT_NAME
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
    
    return await response.json()
  } catch (error) {
    console.error('Error calling read-only function:', error)
    throw error
  }
}

// Get payment details from contract
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const result = await callReadOnlyFunction('get-payment', [uintCV(parseInt(paymentId))])
    return result
  } catch (error) {
    console.error('Error getting payment details:', error)
    throw error
  }
}