export class MarginCalculator {
  /**
   * Calculate PnL for a single position
   */
  calculatePnL(position) {
    const currentPrice = position.currentPrice || position.current_price || position.entryPrice
    const entryPrice = position.entryPrice || position.entry_price || 0
    const size = position.size || 0
    
    const priceDiff = size > 0 
      ? currentPrice - entryPrice  // Long
      : entryPrice - currentPrice  // Short
    
    return priceDiff * Math.abs(size)
  }

  /**
   * Calculate required margin for a position
   */
  calculateRequiredMargin(position) {
    const currentPrice = position.currentPrice || position.current_price || position.entryPrice
    const size = position.size || 0
    const leverage = position.leverage || 1
    
    const notional = Math.abs(size * currentPrice)
    return notional / leverage
  }

  /**
   * Calculate total portfolio value including unrealized PnL
   */
  calculatePortfolioValue(collateral, positions) {
    const totalPnL = positions.reduce((sum, pos) => {
      return sum + this.calculatePnL(pos)
    }, 0)
    
    return collateral + totalPnL
  }

  /**
   * Calculate total used margin
   */
  calculateUsedMargin(positions) {
    return positions.reduce((sum, pos) => {
      return sum + this.calculateRequiredMargin(pos)
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
    const size = position.size || 0
    const entryPrice = position.entryPrice || position.entry_price || 0
    
    if (size === 0) return 0
    
    const availableMargin = totalCollateral - usedMargin
    const priceMove = (availableMargin * (1 - maintenanceMarginRatio)) / Math.abs(size)
    
    return size > 0 
      ? Math.max(0, entryPrice - priceMove)  // Long
      : entryPrice + priceMove  // Short
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
  calculateHedgingBenefit(positions) {
    const exposureByAsset = {}
    
    positions.forEach(pos => {
      const asset = pos.asset || pos.market?.split('-')[0] || 'UNKNOWN'
      const currentPrice = pos.currentPrice || pos.current_price || pos.entryPrice || 0
      const size = pos.size || 0
      const exposure = size * currentPrice
      
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