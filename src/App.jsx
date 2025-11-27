import { useAccount } from 'wagmi'
import { Calculator, AlertCircle } from 'lucide-react'
import WalletConnect from './components/WalletConnect'
import MarginDashboard from './components/MarginDashboard'
import { usePriceUpdates } from './hooks/usePriceUpdates'

export default function App() {
  const { isConnected } = useAccount()
  const { isConnected: wsConnected } = usePriceUpdates()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Reya Portfolio Margin</h1>
              <p className="text-xs text-slate-400">Cross-margin calculator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* WebSocket Status */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-slate-400">
                {wsConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <Calculator className="w-20 h-20 mx-auto mb-6 text-blue-500 opacity-50" />
            <h2 className="text-3xl font-bold mb-4">
              Connect Your Wallet to Get Started
            </h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              View your cross-margin positions across all Reya Network exchanges in one unified dashboard.
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </div>
        ) : (
          <MarginDashboard />
        )}

        {/* Info Banner */}
        {isConnected && (
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-semibold mb-2">About Cross-Margining on Reya</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  This calculator demonstrates Reya Network's universal margin system. Unlike traditional DEXs where you need 
                  separate margin for each protocol, Reya allows you to use one collateral pool across ALL exchanges. This increases 
                  capital efficiency by 3.5x for traders and 6x for liquidity providers.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}