class ReyaWebSocket {
  constructor() {
    this.ws = null
    this.subscribers = {}
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
  }

  connect() {
    try {
      this.ws = new WebSocket('wss://ws.reya.network')
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected')
        this.reconnectAttempts = 0
        this.subscribeToChannels()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.notifySubscribers(data)
        } catch (error) {
          console.error('Error parsing WS message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Connection error:', error)
      this.attemptReconnect()
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }
    
    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    )
    
    console.log(`Reconnecting in ${delay/1000}s...`)
    setTimeout(() => this.connect(), delay)
  }

  subscribeToChannels() {
    if (!this.isConnected()) return

    const message = {
      type: 'subscribe',
      channels: ['market_data', 'ticker', 'trades']
    }
    
    this.ws.send(JSON.stringify(message))
  }

  notifySubscribers(data) {
    Object.values(this.subscribers).forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Subscriber callback error:', error)
      }
    })
  }

  subscribe(id, callback) {
    this.subscribers[id] = callback
    return () => this.unsubscribe(id)
  }

  unsubscribe(id) {
    delete this.subscribers[id]
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers = {}
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

export default new ReyaWebSocket()
