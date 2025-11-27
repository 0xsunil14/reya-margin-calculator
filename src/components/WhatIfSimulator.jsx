import React, { useState } from 'react'
import { Activity, Play } from 'lucide-react'
import marginCalculator from '../utils/marginCalculator'

export default function WhatIfSimulator({ positions, collateral }) {
  const [priceChange, setPriceChange] = useState(0)
  const [result, setResult] = useState(null)
  
  const runSimulation = () => {
    if (positions.length === 0) {
      setResult({ error: 'No positions to simulate' })
      return
    }
    
    const multiplier = 1 + (priceChange / 100)
    
    // Simulate price changes
    const simulatedPositions = positions.map(pos => ({
      ...pos,
      currentPrice: pos.currentPrice * multiplier
    }))
    
    // Calculate new metrics
    const totalPnL = simulatedPositions.reduce((sum, pos) => 
      sum + marginCalculator.calculatePnL(pos), 0
    )
    
    const newAccountValue = collateral + totalPnL
    const usedMargin = simulatedPositions.reduce((sum, pos) => 
      sum + marginCalculator.calculateRequiredMargin(pos), 0
    )
    
    const utilization = marginCalculator.calculateMarginUtilization(usedMargin, newAccountValue)
    const risk = marginCalculator.getRiskLevel(utilization)
    
    setResult({
      totalPnL,
      newAccountValue,
      utilization,
      risk,
      priceChange
    })
  }
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">What-If Simulator</h3>
      </div>
      
      <div className="space-y-4">
        {/* Input Section */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">
            Simulate Price Change (%)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={priceChange}
              onChange={(e) => setPriceChange(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., 10 or -5"
              step="0.1"
            />
            <button
              onClick={runSimulation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Simulate
            </button>
          </div>
        </div>
        
        {/* Results Section */}
        {result && !result.error && (
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30 space-y-2">
            <div className="text-sm font-semibold text-blue-400 mb-2">
              Scenario: {result.priceChange > 0 ? '+' : ''}{result.priceChange}% price change
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">New PnL:</span>
              <span className={`font-semibold ${result.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {result.totalPnL >= 0 ? '+' : ''}${result.totalPnL.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Account Value:</span>
              <span className="font-semibold">${result.newAccountValue.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Utilization:</span>
              <span className="font-semibold">{result.utilization.toFixed(1)}%</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Risk Level:</span>
              <span className={`font-semibold text-${result.risk.color}-400`}>
                {result.risk.level}
              </span>
            </div>
          </div>
        )}
        
        {result && result.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {result.error}
          </div>
        )}
        
        {/* Help Text */}
        <p className="text-xs text-slate-500">
          Test how your portfolio would perform if all asset prices changed by the specified percentage
        </p>
      </div>
    </div>
  )
}