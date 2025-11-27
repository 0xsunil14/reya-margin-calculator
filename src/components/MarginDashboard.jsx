import React, { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import CollateralOverview from './CollateralOverview'
import MarginHealthIndicator from './MarginHealthIndicator'
import PositionsList from './PositionsList'
import WhatIfSimulator from './WhatIfSimulator'
import AlertSettings from './AlertSettings'
import marginCalculator from '../utils/marginCalculator'

const INITIAL_POSITIONS = [
  {
    id: 1,
    exchange: 'Reya Perps',
    asset: 'BTC',
    type: 'Long',
    size: 0.5,
    leverage: 10,
    entryPrice: 43000,
    currentPrice: 44500
  },
  {
    id: 2,
    exchange: 'Reya Options',
    asset: 'ETH',
    type: 'Short',
    size: 2,
    leverage: 5,
    entryPrice: 2300,
    currentPrice: 2250
  }
]

export default function MarginDashboard() {
  const [collateral, setCollateral] = useState(50000)
  const [positions, setPositions] = useState(INITIAL_POSITIONS)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Calculate metrics
  const totalPnL = positions.reduce((sum, pos) => 
    sum + marginCalculator.calculatePnL(pos), 0
  )
  
  const totalUsedMargin = positions.reduce((sum, pos) => 
    sum + marginCalculator.calculateRequiredMargin(pos), 0
  )
  
  const accountValue = collateral + totalPnL
  const utilization = marginCalculator.calculateMarginUtilization(totalUsedMargin, accountValue)
  const availableMargin = marginCalculator.calculateAvailableMargin(accountValue, totalUsedMargin)
  
  // Handlers
  const updatePrice = (id, newPrice) => {
    setPositions(positions.map(pos => 
      pos.id === id ? { ...pos, currentPrice: newPrice } : pos
    ))
  }
  
  const removePosition = (id) => {
    setPositions(positions.filter(pos => pos.id !== id))
  }
  
  const addPosition = (newPosition) => {
    setPositions([...positions, { ...newPosition, id: Date.now() }])
    setShowAddForm(false)
  }
  
  return (
    <div className="space-y-6">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <CollateralOverview
            collateral={collateral}
            totalPnL={totalPnL}
            accountValue={accountValue}
            availableMargin={availableMargin}
            onCollateralChange={setCollateral}
          />
          
          <MarginHealthIndicator
            utilization={utilization}
            usedMargin={totalUsedMargin}
            availableMargin={availableMargin}
          />
        </div>
        
        {/* Right Column - Positions */}
        <div className="lg:col-span-2 space-y-6">
          <PositionsList
            positions={positions}
            onUpdatePrice={updatePrice}
            onRemove={removePosition}
          />
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Position
          </button>
          
          {showAddForm && (
            <AddPositionForm onAdd={addPosition} onCancel={() => setShowAddForm(false)} />
          )}
        </div>
      </div>
      
      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WhatIfSimulator positions={positions} collateral={collateral} />
        <AlertSettings />
      </div>
    </div>
  )
}

// Add Position Form Component
function AddPositionForm({ onAdd, onCancel }) {
  const [formData, setFormData] = useState({
    exchange: 'Reya Perps',
    asset: 'BTC',
    type: 'Long',
    size: 1,
    leverage: 10,
    entryPrice: 43000,
    currentPrice: 43000
  })
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(formData)
  }
  
  const updateField = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // Sync current price with entry price initially
      if (field === 'entryPrice') {
        updated.currentPrice = value
      }
      return updated
    })
  }
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4">Add New Position</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Exchange</label>
          <select 
            value={formData.exchange}
            onChange={(e) => updateField('exchange', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option>Reya Perps</option>
            <option>Reya Options</option>
            <option>Reya Spot</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Asset</label>
          <select 
            value={formData.asset}
            onChange={(e) => updateField('asset', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option>BTC</option>
            <option>ETH</option>
            <option>SOL</option>
            <option>ARB</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Type</label>
          <select 
            value={formData.type}
            onChange={(e) => updateField('type', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option>Long</option>
            <option>Short</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Size</label>
          <input
            type="number"
            step="0.01"
            value={formData.size}
            onChange={(e) => updateField('size', parseFloat(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Leverage</label>
          <input
            type="number"
            value={formData.leverage}
            onChange={(e) => updateField('leverage', parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Entry Price</label>
          <input
            type="number"
            value={formData.entryPrice}
            onChange={(e) => updateField('entryPrice', parseFloat(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg py-2 font-medium transition-colors"
        >
          Add Position
        </button>
        <button
          onClick={onCancel}
          className="px-6 bg-slate-700 hover:bg-slate-600 rounded-lg py-2 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}