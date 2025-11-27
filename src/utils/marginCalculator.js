export class MarginCalculator {
  /**
   * Calculate PnL for a single position
   */
  calculatePnL(position, currentPrice) {
    const price = currentPrice || position.current_price || position.entry_price
    const priceDiff = position.size > 0 
      ? price - position.entry_price  // Long
      : position.entry_price - price  // Short
    
    return priceDiff * Math.abs(position.size)
  }

  /**
   * Calculate required margin for a position
   */
  calculateRequiredMargin(position, currentPrice) {
    const price = currentPrice || position.current_price || position.entry_price
    const notional = Math.abs(position.size * price)
    const leverage = position.leverage || 1
    
    return notional / leverage
  }

  /**
   * Calculate total portfolio value including unrealized PnL
   */
  calculatePortfolioValue(collateral, positions, currentPrices = {}) {
    const totalPnL = positions.reduce((sum, pos) => {
      const price = currentPrices[pos.market] || pos.current_price
      return sum + this.calculatePnL(pos, price)
    }, 0)
    
    return collateral + totalPnL
  }

  /**
   * Calculate total used margin
   */
  calculateUsedMargin(positions, currentPrices = {}) {
    return positions.reduce((sum, pos) => {
      const price = currentPrices[pos.market] || pos.current_price
      return sum + this.calculateRequiredMargin(pos, price)
    }, 0)
  }

  /**
   * Calculate margin utilization percentage
   */
  calculateMarginUtilization(usedMargin, accountValue) {
    if (accountValue <= 0) return 0
    return (usedMargin / accountValue) * 100
  }

  /**
   * Calculate liquidation price for a position
   */
  calculateLiquidationPrice(position, totalCollateral, usedMargin) {
    const maintenanceMarginRatio = 0.03 // 3% maintenance margin
    const { size, entry_price } = position
    
    if (size === 0) return 0
    
    const availableMargin = totalCollateral - usedMargin
    const priceMove = (availableMargin * (1 - maintenanceMarginRatio)) / Math.abs(size)
    
    return size > 0 
      ? Math.max(0, entry_price - priceMove)  // Long
      : entry_price + priceMove  // Short
  }

  /**
   * Get risk level based on margin utilization
   */
  getRiskLevel(utilizationPercent) {
    if (utilizationPercent >= 80) return { level: 'High', color: 'red', severity: 3 }
    if (utilizationPercent >= 60) return { level: 'Medium', color: 'yellow', severity: 2 }
    return { level: 'Low', color: 'green', severity: 1 }
  }

  /**
   * Calculate available margin for new positions
   */
  calculateAvailableMargin(accountValue, usedMargin) {
    return Math.max(0, accountValue - usedMargin)
  }

  /**
   * Calculate cross-margin hedging benefits
   */
  calculateHedgingBenefit(positions, currentPrices = {}) {
    const exposureByAsset = {}
    
    positions.forEach(pos => {
      const asset = pos.asset || pos.market?.split('-')[0]
      const price = currentPrices[pos.market] || pos.current_price
      const exposure = pos.size * price
      
      exposureByAsset[asset] = (exposureByAsset[asset] || 0) + exposure
    })
    
    const totalExposure = Object.values(exposureByAsset)
      .reduce((sum, exp) => sum + Math.abs(exp), 0)
    
    const netExposure = Math.abs(
      Object.values(exposureByAsset).reduce((sum, exp) => sum + exp, 0)
    )
    
    const hedgingBenefit = totalExposure - netExposure
    const benefitPercent = totalExposure > 0 ? (hedgingBenefit / totalExposure) * 100 : 0
    
    return {
      totalExposure,
      netExposure,
      hedgingBenefit,
      benefitPercent: Math.round(benefitPercent * 100) / 100
    }
  }
}

export default new MarginCalculator()