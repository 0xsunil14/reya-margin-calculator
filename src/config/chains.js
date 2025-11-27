import { defineChain } from 'viem'

export const reyaNetwork = defineChain({
  id: 1729,
  name: 'Reya Network',
  network: 'reya',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.reya.network'] },
    public: { http: ['https://rpc.reya.network'] },
  },
  blockExplorers: {
    default: { 
      name: 'Reya Explorer', 
      url: 'https://explorer.reya.network' 
    },
  },
  testnet: false,
})