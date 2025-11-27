import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useAccount } from 'wagmi'

import CollateralOverview from './CollateralOverview'
import MarginHealthIndicator from './MarginHealthIndicator'
import PositionsList from './PositionsList'
import WhatIfSimulator from './WhatIfSimulator'
import AlertSettings from './AlertSettings'
import marginCalculator from '../utils/marginCalculator'
import reyaApi from '../services/reyaApi'

export default function MarginDashboard() {
  const { address, isConnected } = useAccount()

  const [collateral, setCollateral] = useState(10000) // Default demo collateral
  const [positions, setPositions] = useState([
    // Demo positions for testing
    {
      id: 1,
      exchange: 'Reya Perps',
      asset: 'BTC',
      type: 'Long',
      size: 0.5,
      leverage: 10,
      entryPrice: 45000,
      currentPrice: 46500
    },
    {
      id: 2,
      exchange: 'Reya Perps',
      asset: 'ETH',
      type: 'Short',
      size: 5,
      leverage: 5,
      entryPrice: 2500,
      currentPrice: 2450
    }
  ])
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load Reya data from API
  const loadReyaData = async () => {
    if (!isConnected || !address) {
      // Keep demo data when not connected
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [accounts, positionsFromApi, markets] = await Promise.all([
        reyaApi.getAccounts(address),
        reyaApi.getPositions(address),
        reyaApi.getAllMarketsSummary()
      ])

      // Process accounts for collateral
      let totalCollateral = 0
      if (Array.isArray(accounts) && accounts.length > 0) {
        totalCollateral = accounts.reduce((sum, account) => {
          return sum + (
            account.equity || 
            account.collateral || 
            account.balance || 
            account.marginBalance || 
            0
          )
        }, 0)
      }

      // Process positions from API
      const mappedPositions = []
      if (Array.isArray(positionsFromApi) && positionsFromApi.length > 0) {
        positionsFromApi.forEach((apiPos, idx) => {
          // Find matching market for current price
          const market = markets.find(m => 
            m.symbol === apiPos.symbol || 
            m.symbol === apiPos.market
          )

          const currentPrice = market 
            ? parseFloat(market.throttledOraclePrice || market.throttledPoolPrice || '0')
            : apiPos.markPrice || apiPos.indexPrice || apiPos.entryPrice || 0

          mappedPositions.push({
            id: Date.now() + idx,
            exchange: 'Reya Perps',
            asset: apiPos.symbol || apiPos.market || 'UNKNOWN',
            type: (apiPos.side === 'LONG' || apiPos.size > 0) ? 'Long' : 'Short',
            size: Math.abs(apiPos.size || apiPos.positionSize || 0),
            leverage: apiPos.leverage || 1,
            entryPrice: apiPos.entryPrice || apiPos.avgEntryPrice || 0,
            currentPrice: currentPrice
          })
        })
      }

      // Update state with real data
      if (totalCollateral > 0) {
        setCollateral(totalCollateral)
      }
      
      if (mappedPositions.length > 0) {
        setPositions(mappedPositions)
      }

      console.log('✅ Loaded Reya data:', {
        accounts: accounts?.length || 0,
        positions: mappedPositions.length,
        collateral: totalCollateral
      })

    } catch (err) {
      console.error('Failed to load Reya data:', err)
      setError('Failed to load live data from Reya. Using demo data.')
      // Keep demo data on error
    } finally {
      setLoading(false)
    }
  }

  // Load when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadReyaData()
    }
  }, [isConnected, address])

  // Calculate portfolio metrics
  const totalPnL = positions.reduce((sum, pos) => {
    return sum + marginCalculator.calculatePnL(pos)
  }, 0)

  const totalUsedMargin = positions.reduce((sum, pos) => {
    return sum + marginCalculator.calculateRequiredMargin(pos)
  }, 0)

  const accountValue = collateral + totalPnL
  const utilization = marginCalculator.calculateMarginUtilization(totalUsedMargin, accountValue)
  const availableMargin = marginCalculator.calculateAvailableMargin(accountValue, totalUsedMargin)

  // Handlers
  const updatePrice = (id, newPrice) => {
    setPositions(positions.map(pos =>
      pos.id === id ? { ...pos, currentPrice: parseFloat(newPrice) || pos.currentPrice } : pos
    ))
  }

  const removePosition = (id) => {
    setPositions(positions.filter(pos => pos.id !== id))
  }

  const addPosition = (newPosition) => {
    setPositions([
      ...positions, 
      { 
        ...newPosition, 
        id: Date.now(),
        currentPrice: newPosition.currentPrice || newPosition.entryPrice
      }
    ])
    setShowAddForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
        <div className="flex items-center gap-2">
          {loading && (
            <>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-400">Loading live data from Reya...</span>
            </>
          )}

          {!loading && !isConnected && (
            <>
              <div className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="text-slate-400">Demo Mode - Connect wallet for live data</span>
            </>
          )}

          {!loading && isConnected && !error && (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-400">
                {positions.length > 0 ? 'Live data loaded' : 'No positions found'}
              </span>
            </>
          )}

          {error && (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-400">{error}</span>
            </>
          )}
        </div>

        {isConnected && (
          <button
            onClick={loadReyaData}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-600 text-slate-200 text-xs hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

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
            {showAddForm ? 'Cancel' : 'Add Position'}
          </button>

          {showAddForm && (
            <AddPositionForm
              onAdd={addPosition}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WhatIfSimulator positions={positions} collateral={accountValue} />
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
    entryPrice: 45000,
    currentPrice: 45000
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.size > 0 && formData.entryPrice > 0) {
      onAdd(formData)
    }
  }

  const updateField = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      // Sync currentPrice with entryPrice when entry changes
      if (field === 'entryPrice') {
        updated.currentPrice = value
      }
      return updated
    })
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4">Add New Position</h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {/* Exchange */}
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

          {/* Asset */}
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
              <option>AVAX</option>
            </select>
          </div>

          {/* Type */}
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

          {/* Leverage */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Leverage</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.leverage}
              onChange={(e) => updateField('leverage', parseInt(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Size */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Size</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.size}
              onChange={(e) => updateField('size', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Entry Price */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Entry Price</label>
            <input
              type="number"
              min="0"
              value={formData.entryPrice}
              onChange={(e) => updateField('entryPrice', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg py-2 font-medium transition-colors"
          >
            Add Position
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-slate-700 hover:bg-slate-600 rounded-lg py-2 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}