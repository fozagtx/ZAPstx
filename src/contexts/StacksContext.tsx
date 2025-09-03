'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  connectWallet as connectStacksWallet, 
  disconnectWallet as disconnectStacksWallet,
  isUserSignedIn,
  getUserData,
  getUserAddress 
} from '@/lib/stacks'

interface StacksContextType {
  isConnected: boolean
  userAddress: string | null
  userData: any
  connect: () => void
  disconnect: () => void
  isLoading: boolean
}

const StacksContext = createContext<StacksContextType | undefined>(undefined)

export const useStacks = () => {
  const context = useContext(StacksContext)
  if (context === undefined) {
    throw new Error('useStacks must be used within a StacksProvider')
  }
  return context
}

interface StacksProviderProps {
  children: ReactNode
}

export const StacksProvider: React.FC<StacksProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = () => {
      try {
        const connected = isUserSignedIn()
        setIsConnected(connected)
        
        if (connected) {
          const data = getUserData()
          const address = getUserAddress()
          setUserData(data)
          setUserAddress(address)
        } else {
          setUserData(null)
          setUserAddress(null)
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
        setIsConnected(false)
        setUserData(null)
        setUserAddress(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Check connection on mount
    checkConnection()

    // Check connection when the page gains focus (user might have connected in another tab)
    const handleFocus = () => checkConnection()
    window.addEventListener('focus', handleFocus)

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const connect = () => {
    setIsLoading(true)
    connectStacksWallet()
  }

  const disconnect = () => {
    setIsLoading(true)
    disconnectStacksWallet()
  }

  const value: StacksContextType = {
    isConnected,
    userAddress,
    userData,
    connect,
    disconnect,
    isLoading,
  }

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  )
}