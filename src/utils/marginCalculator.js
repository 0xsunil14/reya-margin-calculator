// src/utils/marginCalculator.js - FIXED VERSION

export class MarginCalculator {
  /**
   * Calculate PnL for a single position
   * Handles both camelCase and snake_case field names
   */
  calculatePnL(position) {
    const currentPrice = position.currentPrice || position.current_price || position.entryPrice || 0
    const entryPrice = position.entryPrice || position.entry_price || 0
    const size = position.size || 0
    
    // Calculate price difference based on position type
    const priceDiff = (position.type === 'Long' || size > 0)
      ? currentPrice - entryPrice  // Long position
      : entryPrice - currentPrice  // Short position
    
    return priceDiff * Math.abs(size)
  }

  /**
   * Calculate required margin for a position
   */
  calculateRequiredMargin(position) {
    const currentPrice = position.currentPrice || position.current_price || position.entryPrice || 0
    const size = Math.abs(position.size || 0)
    const leverage = position.leverage || 1
    
    const notional = size * currentPrice
    return leverage > 0 ? notional / leverage : notional
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
   * Calculate total used margin across all positions
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
    const utilization = (usedMargin / accountValue) * 100
    return Math.min(utilization, 100) // Cap at 100%
  }

  /**
   * Calculate available margin for new positions
   */
  calculateAvailableMargin(accountValue, usedMargin) {
    return Math.max(0, accountValue - usedMargin)
  }

  /**
   * Calculate liquidation price for a position
   */
  calculateLiquidationPrice(position, totalCollateral, usedMargin) {
    const maintenanceMarginRatio = 0.03 // 3% maintenance margin
    const size = position.size || 0
    const entryPrice = position.entryPrice || position.entry_price || 0
    const leverage = position.leverage || 1
    
    if (size === 0 || entryPrice === 0) return 0
    
    // Calculate liquidation price based on position type
    const maintenanceMargin = (Math.abs(size) * entryPrice * maintenanceMarginRatio)
    const initialMargin = (Math.abs(size) * entryPrice) / leverage
    const buffer = initialMargin - maintenanceMargin
    const priceMove = buffer / Math.abs(size)
    
    if (size > 0) {
      // Long position: liquidation when price drops
      return Math.max(0, entryPrice - priceMove)
    } else {
      // Short position: liquidation when price rises
      return entryPrice + priceMove
    }
  }

  /**
   * Get risk level based on margin utilization
   */
  getRiskLevel(utilizationPercent) {
    if (utilizationPercent >= 80) {
      return { 
        level: 'High', 
        color: 'red', 
        severity: 3,
        message: 'Critical - Close to liquidation'
      }
    }
    if (utilizationPercent >= 60) {
      return { 
        level: 'Medium', 
        color: 'yellow', 
        severity: 2,
        message: 'Warning - Monitor positions'
      }
    }
    return { 
      level: 'Low', 
      color: 'green', 
      severity: 1,
      message: 'Healthy margin'
    }
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
      benefitPercent: Math.round(benefitPercent * 100) / 100,
      exposureByAsset
    }
  }

  /**
   * Calculate portfolio statistics
   */
  calculatePortfolioStats(positions, collateral) {
    const totalPnL = positions.reduce((sum, pos) => sum + this.calculatePnL(pos), 0)
    const usedMargin = this.calculateUsedMargin(positions)
    const accountValue = collateral + totalPnL
    const availableMargin = this.calculateAvailableMargin(accountValue, usedMargin)
    const utilization = this.calculateMarginUtilization(usedMargin, accountValue)
    const riskLevel = this.getRiskLevel(utilization)
    
    return {
      totalPnL,
      usedMargin,
      accountValue,
      availableMargin,
      utilization,
      riskLevel,
      positionCount: positions.length
    }
  }
}

export default new MarginCalculator()