# Reya Portfolio Margin Calculator

A modern, production-ready cross-margin calculator for Reya Network built with React, Vite, and TailwindCSS.

## Features

- Cross-Margin Calculation - One collateral pool for all positions
- Real-time PnL Tracking - Live profit/loss calculations
- Margin Health Monitoring - Visual risk indicators
- What-If Simulator - Test scenarios before trading
- Multi-Exchange Support - Reya Perps, Options, and Spot
- Wallet Integration - Connect with Web3Modal
- Responsive Design - Works on mobile, tablet, and desktop

## Installation
```bash
# Clone the repository
git clone 
cd reya-margin-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

1. Get a WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

2. Update `src/main.jsx`:
```javascript
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'
```

3. Start the dev server:
```bash
npm run dev
```

## Tech Stack

- React 18 - UI framework
- Vite - Build tool
- TailwindCSS - Styling
- wagmi v2 - Ethereum library
- Web3Modal - Wallet connection
- Lucide React - Icons
- Axios - HTTP client
- Recharts - Data visualization

## Project Structure
```
reya-margin-calculator/
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API & WebSocket services
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

## Building for Production
```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## Usage

1. Connect Wallet - Click "Connect Wallet" in the header
2. Set Collateral - Enter your total collateral amount
3. Add Positions - Click "Add Position" to create new positions
4. Monitor Health - Watch the margin health indicator
5. Simulate Scenarios - Use the What-If simulator to test price changes

## Key Calculations

- PnL: `(currentPrice - entryPrice) × size` (reversed for shorts)
- Required Margin: `positionValue / leverage`
- Utilization: `(totalRequiredMargin / accountValue) × 100`
- Liquidation Price: Based on maintenance margin and available buffer

## API Integration

The application connects to Reya Network's API endpoints:

- `/wallet/{address}/accounts` - Fetch collateral and equity
- `/wallet/{address}/positions` - Get all open positions
- `/markets/summary` - Real-time oracle prices

WebSocket connection for live price updates: `wss://ws.reya.network`

## Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or production.

## Links

- [Reya Network](https://reya.network)
- [Reya Docs](https://docs.reya.xyz)
- [wagmi Documentation](https://wagmi.sh)
- [Web3Modal Documentation](https://docs.walletconnect.com/web3modal/about)

## Support

For issues or questions, please open an issue on GitHub or reach out to the Reya community.

---

Built for the Reya community
