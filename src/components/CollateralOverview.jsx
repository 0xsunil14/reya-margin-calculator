import React from 'react'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

export default function CollateralOverview({ 
  collateral, 
  totalPnL, 
  accountValue, 
  availableMargin,
  onCollateralChange 
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Collateral Overview</h3>
      </div>
      
      <div className="space-y-4">
        {/* Collateral Input */}
        <div>
          <label className="text-sm text-slate-400 mb-2 block">
            Total Collateral
          </label>
          <input
            type="number"
            value={collateral}
            onChange={(e) => onCollateralChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-lg font-semibold focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="0.00"
          />
        </div>
        
        {/* PnL Display */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Unrealized PnL</span>
          <div className="flex items-center gap-2">
            {totalPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`font-semibold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="h-px bg-slate-700" />
        
        {/* Account Value */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Account Value</span>
          <span className="text-xl font-bold text-blue-400">
            ${accountValue.toLocaleString()}
          </span>
        </div>
        
        {/* Available Margin */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Available Margin</span>
          <span className="font-semibold text-green-400">
            ${availableMargin.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}