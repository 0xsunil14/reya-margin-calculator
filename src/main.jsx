import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'
import { reyaNetwork } from './config/chains'

// Get projectId from https://cloud.walletconnect.com
const projectId = '8d571b3db0f71c579842481c98e50dbd'

// Create wagmiConfig
const wagmiConfig = createConfig({
  chains: [reyaNetwork],
  transports: {
    [reyaNetwork.id]: http(),
  },
  connectors: [
    walletConnect({ projectId }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: 'Reya Margin Calculator',
    }),
  ],
})

// Create Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#0ea5e9',
  }
})

// Create React Query client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
) 