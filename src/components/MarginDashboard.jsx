import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useAccount } from 'wagmi'

import CollateralOverview from './CollateralOverview'
import MarginHealthIndicator from './MarginHealthIndicator'
import PositionsList from './PositionsList'
import WhatIfSimulator from './WhatIfSimulator'
import AlertSettings from './AlertSettings'
import marginCalculator from '../utils/marginCalculator'
import reyaApi from '../services/reyaApi' // make sure this path/file name is correct

export default function MarginDashboard() {
    const { address, isConnected } = useAccount()

    const [collateral, setCollateral] = useState(0)
    const [positions, setPositions] = useState([])
    const [showAddForm, setShowAddForm] = useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // 🔄 Single function to load Reya data
    const loadReyaData = async () => {
        if (!isConnected || !address) {
            setPositions([])
            setCollateral(0)
            setError(null)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const [accounts, positionsFromApi] = await Promise.all([
                reyaApi.getAccounts(address),
                reyaApi.getPositions(address)
            ])

            // Map Reya positions → UI shape
            const mapped = (positionsFromApi || []).map((p, idx) => ({
                id: idx + 1,
                exchange: 'Reya Perps',
                asset: p.symbol || p.market || 'Unknown',
                type: p.side === 'LONG' ? 'Long' : 'Short',
                size: p.positionSize ?? p.size ?? 0,
                leverage: p.leverage ?? 1,
                entryPrice: p.entryPrice ?? 0,
                currentPrice: p.markPrice ?? p.indexPrice ?? p.entryPrice ?? 0
            }))

            setPositions(mapped) // if empty, you see "No positions found"

            // Collateral (adjust fields once you see real API shape)
            const totalCollateral = Array.isArray(accounts)
                ? accounts.reduce(
                    (sum, a) => sum + (a.equity ?? a.collateral ?? a.balance ?? 0),
                    0
                )
                : 0

            setCollateral(totalCollateral)
        } catch (err) {
            console.error('Failed to load Reya data', err)
            setError('Failed to load Reya data')
            setPositions([])
            setCollateral(0)
        } finally {
            setLoading(false)
        }
    }

    // Load when wallet connects / changes
    useEffect(() => {
        loadReyaData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, address])

    // 📊 Calculations
    const totalPnL = positions.reduce(
        (sum, pos) => sum + marginCalculator.calculatePnL(pos),
        0
    )

    const totalUsedMargin = positions.reduce(
        (sum, pos) => sum + marginCalculator.calculateRequiredMargin(pos),
        0
    )

    const accountValue = collateral + totalPnL
    const utilization = marginCalculator.calculateMarginUtilization(
        totalUsedMargin,
        accountValue
    )
    const availableMargin = marginCalculator.calculateAvailableMargin(
        accountValue,
        totalUsedMargin
    )

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
            {/* Status bar */}
            <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div>
                    {loading && (
                        <span className="text-blue-400">
                            Loading live data from Reya…
                        </span>
                    )}

                    {!loading && !isConnected && (
                        <span className="text-slate-400">
                            Connect your wallet to view Reya positions.
                        </span>
                    )}

                    {!loading && isConnected && positions.length === 0 && !error && (
                        <span className="text-amber-400">
                            No positions found for this wallet.
                        </span>
                    )}

                    {!loading && isConnected && positions.length > 0 && !error && (
                        <span className="text-emerald-400">
                            Live Reya data loaded for {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                    )}

                    {error && <div className="text-red-400 mt-1">{error}</div>}
                </div>

                {isConnected && (
                    <button
                        onClick={loadReyaData}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-600 text-slate-200 text-xs hover:bg-slate-800 disabled:opacity-60"
                    >
                        <RefreshCw className="w-3 h-3" />
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
                    {positions.length === 0 ? (
                        <div className="text-center text-slate-400 py-6 border border-slate-700/50 rounded-xl">
                            No positions found
                        </div>
                    ) : (
                        <PositionsList
                            positions={positions}
                            onUpdatePrice={updatePrice}
                            onRemove={removePosition}
                        />
                    )}

                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Position
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
                <WhatIfSimulator positions={positions} collateral={collateral} />
                <AlertSettings />
            </div>
        </div>
    )
}

// Add Position Form (same as before, just ensure you still have your inputs inside)
function AddPositionForm({ onAdd, onCancel }) {
    const [markets, setMarkets] = useState([])
    const [loadingMarkets, setLoadingMarkets] = useState(true)
    const [marketError, setMarketError] = useState(null)

    const [formData, setFormData] = useState({
        exchange: 'Reya Perps',
        asset: '',
        type: 'Long',
        size: 1,
        leverage: 1,
        entryPrice: 0,
        currentPrice: 0
    })

    // Load live markets from Reya when form opens
    useEffect(() => {
        const loadMarkets = async () => {
            try {
                const data = await reyaApi.getAllMarketsSummary() // /markets/summary
                const list = Array.isArray(data) ? data : []
                setMarkets(list)

                if (list.length > 0) {
                    const first = list[0]
                    const symbol = first.symbol // we know this exists
                    const price = parseFloat(
                        first.throttledOraclePrice ?? first.throttledPoolPrice ?? '0'
                    )

                    setFormData(prev => ({
                        ...prev,
                        asset: symbol,
                        entryPrice: price,
                        currentPrice: price,
                        leverage: 1 // default, user can change
                    }))
                }
            } catch (err) {
                console.error('Failed to load Reya markets', err)
                setMarketError('Unable to load Reya markets. You can still enter values manually.')
            } finally {
                setLoadingMarkets(false)
            }
        }

        loadMarkets()
    }, [])


    const handleSubmit = (e) => {
        e.preventDefault()
        onAdd(formData)
    }

    const updateField = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value }
            if (field === 'entryPrice' && !markets.length) {
                // if no live market price, keep current == entry initially
                updated.currentPrice = value
            }
            return updated
        })
    }

    const handleAssetChange = (symbol) => {
        const m = markets.find(m => m.symbol === symbol)

        if (m) {
            const price = parseFloat(
                m.throttledOraclePrice ?? m.throttledPoolPrice ?? formData.entryPrice ?? '0'
            )

            setFormData(prev => ({
                ...prev,
                asset: symbol,
                entryPrice: price,
                currentPrice: price
            }))
        } else {
            // fallback if not found in markets (user typed a custom symbol)
            setFormData(prev => ({ ...prev, asset: symbol }))
        }
    }


    // helper: find selected market for current asset
    return (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold mb-4">Add New Position</h3>

            {loadingMarkets && (
                <p className="text-xs text-blue-400 mb-3">
                    Loading Reya markets…
                </p>
            )}

            {marketError && (
                <p className="text-xs text-amber-400 mb-3">
                    {marketError}
                </p>
            )}

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

                    {/* Asset (from live markets if available) */}
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Asset</label>
                        {markets.length > 0 ? (
                            <select
                                value={formData.asset}
                                onChange={(e) => handleAssetChange(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                            >
                                {markets.map((m, idx) => (
                                    <option key={m.symbol ?? idx} value={m.symbol}>
                                        {m.symbol}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={formData.asset}
                                onChange={(e) => updateField('asset', e.target.value)}
                                placeholder="e.g. SUIRUSDPERP"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                            />
                        )}

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

                    {/* Size */}
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Size</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.size}
                            onChange={(e) =>
                                updateField('size', parseFloat(e.target.value) || 0)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Leverage (hint max from market) */}
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Leverage</label>

                        <input
                            type="number"
                            value={formData.leverage}
                            min={1}
                            onChange={(e) =>
                                updateField('leverage', parseInt(e.target.value) || 1)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Entry Price (pre-filled from live market, but editable) */}
                    <div>
                        <label className="text-sm text-slate-400 mb-1 block">Entry Price</label>
                        <input
                            type="number"
                            value={formData.entryPrice}
                            onChange={(e) =>
                                updateField('entryPrice', parseFloat(e.target.value) || 0)
                            }
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

