import { useState, useEffect, useCallback } from 'react'
import ReyaWebSocket from '../services/reyaWebSocket'

export function usePriceUpdates(initialPrices = {}) {
  const [prices, setPrices] = useState(initialPrices)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    ReyaWebSocket.connect()
    
    const checkConnection = () => {
      setIsConnected(ReyaWebSocket.isConnected())
    }
    
    checkConnection()
    const statusInterval = setInterval(checkConnection, 5000)

    const unsubscribe = ReyaWebSocket.subscribe('price-updates', (data) => {
      if (data.type === 'market_update' || data.type === 'ticker') {
        setPrices(prev => ({
          ...prev,
          [data.market]: data.price || data.last_price
        }))
        setLastUpdate(new Date())
      }
    })

    return () => {
      unsubscribe()
      clearInterval(statusInterval)
    }
  }, [])

  const updatePrice = useCallback((market, price) => {
    setPrices(prev => ({ ...prev, [market]: price }))
  }, [])

  return { 
    prices, 
    isConnected, 
    lastUpdate,
    updatePrice
  }
}