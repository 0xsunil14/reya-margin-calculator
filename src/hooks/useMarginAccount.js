import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import ReyaAPI from '../services/reyaApi'

export function useMarginAccount() {
  const { address, isConnected } = useAccount()
  const [accounts, setAccounts] = useState([])
  const [positions, setPositions] = useState([])
  const [configuration, setConfiguration] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    if (!isConnected || !address) {
      setAccounts([])
      setPositions([])
      setConfiguration(null)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const [accountsData, positionsData, configData] = await Promise.all([
        ReyaAPI.getAccounts(address),
        ReyaAPI.getPositions(address),
        ReyaAPI.getConfiguration(address),
      ])
      
      setAccounts(accountsData)
      setPositions(positionsData)
      setConfiguration(configData)
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [address, isConnected])

  return { 
    accounts, 
    positions, 
    configuration, 
    loading, 
    error,
    refetch: fetchData
  }
}