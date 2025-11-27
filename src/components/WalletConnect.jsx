import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet } from 'lucide-react'

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </button>
    )
  }

  return <w3m-button />
}
