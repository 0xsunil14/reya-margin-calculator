import axios from 'axios'

const REYA_API_BASE = 'https://api.reya.xyz/v2'

class ReyaAPI {
  constructor() {
    this.client = axios.create({
      baseURL: REYA_API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  // Get margin accounts for wallet
  async getAccounts(walletAddress) {
    try {
      const response = await this.client.get(`/wallet/${walletAddress}/accounts`)
      return response.data
    } catch (error) {
      console.error('Error fetching accounts:', error)
      return []
    }
  }

  // Get all positions for wallet
  async getPositions(walletAddress) {
    try {
      const response = await this.client.get(`/wallet/${walletAddress}/positions`)
      return response.data
    } catch (error) {
      console.error('Error fetching positions:', error)
      return []
    }
  }

  // Get account configuration
  async getConfiguration(walletAddress) {
    try {
      const response = await this.client.get(`/wallet/${walletAddress}/configuration`)
      return response.data
    } catch (error) {
      console.error('Error fetching configuration:', error)
      return null
    }
  }

  // Get market summary for a symbol
  async getMarketSummary(symbol) {
    try {
      const response = await this.client.get(`/market/${symbol}/summary`)
      return response.data
    } catch (error) {
      console.error(`Error fetching ${symbol} market:`, error)
      return null
    }
  }

  // Get all markets summary
  async getAllMarketsSummary() {
    try {
      const response = await this.client.get('/markets/summary')
      return response.data
    } catch (error) {
      console.error('Error fetching markets:', error)
      return []
    }
  }

  // Get historical funding rates
  async getFundingRates(market) {
    try {
      const response = await this.client.get(`/market/${market}/funding`)
      return response.data
    } catch (error) {
      console.error('Error fetching funding rates:', error)
      return []
    }
  }
}

export default new ReyaAPI()