import React from 'react'
import { BarChart3, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import marginCalculator from '../utils/marginCalculator'

export default function PositionsList({ positions, onUpdatePrice, onRemove }) {
  if (positions.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-slate-400">No active positions</p>
        <p className="text-sm text-slate-500 mt-1">Add a position to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Active Positions</h3>
        </div>
        <span className="text-sm text-slate-400">{positions.length} position{positions.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="space-y-3">
        {positions.map(position => {
          const pnl = marginCalculator.calculatePnL(position)
          const requiredMargin = marginCalculator.calculateRequiredMargin(position)
          const liqPrice = marginCalculator.calculateLiquidationPrice(position, 0, 0)
          const pnlPercent = ((pnl / requiredMargin) * 100).toFixed(2)
          
          return (
            <div 
              key={position.id} 
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xl">{position.asset}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      position.type === 'Long' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {position.type}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {position.leverage}x
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{position.exchange}</span>
                </div>
                
                <button
                  onClick={() => onRemove(position.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1"
                  title="Remove position"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Position Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-slate-400">Size:</span>
                  <span className="ml-2 font-medium">{position.size} {position.asset}</span>
                </div>
                
                <div>
                  <span className="text-slate-400">Entry:</span>
                  <span className="ml-2 font-medium">${position.entryPrice.toLocaleString()}</span>
                </div>
                
                <div>
                  <span className="text-slate-400">Current:</span>
                  <input
                    type="number"
                    value={position.currentPrice}
                    onChange={(e) => onUpdatePrice(position.id, parseFloat(e.target.value) || position.currentPrice)}
                    className="ml-2 w-28 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <span className="text-slate-400">Liq Price:</span>
                  <span className="ml-2 font-medium text-red-400">${liqPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {/* PnL Section */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  {pnl >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-slate-400 text-sm">PnL:</span>
                  <span className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </span>
                  <span className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({pnl >= 0 ? '+' : ''}{pnlPercent}%)
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="text-slate-400 text-sm">Margin: </span>
                  <span className="font-medium">${requiredMargin.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}