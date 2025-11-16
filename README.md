# Multi-Chain Wallet Tracker with AI Analysis

A comprehensive blockchain wallet tracking system that monitors wallets across multiple blockchains with AI-powered transaction analysis, degen wallet detection, and risk scoring.

## Features

- **Multi-Chain Support**: Track wallets across 8 major blockchains
  - Ethereum
  - Polygon
  - BNB Smart Chain (BSC)
  - Arbitrum
  - Optimism
  - Avalanche
  - Solana
  - Bitcoin

- **AI-Powered Analysis**: Advanced transaction pattern analysis using Claude AI
  - Behavioral pattern detection
  - Risk assessment
  - Trading sophistication evaluation
  - Automated insights generation

- **Degen Wallet Detection**: Identify high-activity traders
  - High-frequency trading detection
  - DEX interaction tracking
  - Multi-chain activity analysis
  - Risk score calculation

- **Comprehensive Tracking**:
  - Real-time balance monitoring
  - Transaction history
  - Token transfers (ERC20, SPL)
  - DEX interactions
  - Smart contract interactions
  - Gas usage analytics

## Architecture

```
wallet-tracker/
├── app.js                      # Main application entry
├── config/                     # Configuration files
│   ├── config.js              # Chain configs & API keys
│   └── connectDB.js           # PostgreSQL connection
├── chains/                     # Blockchain adapters
│   ├── evmAdapter.js          # EVM chains (Ethereum, Polygon, BSC, etc.)
│   ├── solanaAdapter.js       # Solana blockchain
│   ├── bitcoinAdapter.js      # Bitcoin blockchain
│   └── chainFactory.js        # Chain adapter factory
├── ai/                         # AI analysis modules
│   ├── transactionAnalyzer.js # AI-powered transaction analysis
│   └── walletPatternDetector.js # Pattern detection & risk scoring
├── routes/                     # API routes
│   └── walletRoutes.js        # Wallet tracking endpoints
├── db/                         # Database layer
│   ├── schema.sql             # Database schema
│   └── queries.js             # Database queries
└── docs/                       # Documentation
    ├── API.md                 # API documentation
    └── SETUP.md               # Setup guide
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- API keys for blockchain explorers (see Configuration)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wallet-tracker.git
cd wallet-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL database**
```bash
# Create database
createdb wallet_tracker

# Run schema
psql wallet_tracker < db/schema.sql
```

4. **Configure environment variables**
```bash
cp .env.sample .env
# Edit .env with your API keys and database URL
```

5. **Start the server**
```bash
npm start
# or for development
npm run dev
```

The server will start on `http://localhost:3000`

## Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wallet_tracker

# Blockchain API Keys (at least one recommended)
ETHERSCAN_API_KEY=your_key
POLYGONSCAN_API_KEY=your_key
BSCSCAN_API_KEY=your_key
# ... see .env.sample for all chains
```

### Optional AI Configuration

```env
# For AI-powered analysis
ANTHROPIC_API_KEY=your_anthropic_key
ENABLE_AI_ANALYSIS=true
```

## API Usage

### Quick Examples

#### 1. Add a wallet to track
```bash
curl -X POST http://localhost:3000/api/wallet/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chain": "ethereum",
    "label": "Vitalik"
  }'
```

#### 2. Get wallet balance across all chains
```bash
curl http://localhost:3000/api/wallet/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

#### 3. Get transactions on a specific chain
```bash
curl http://localhost:3000/api/wallet/transactions/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/ethereum?limit=50
```

#### 4. Analyze wallet behavior with AI
```bash
curl -X POST http://localhost:3000/api/wallet/analyze/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/ethereum
```

#### 5. Get all degen wallets
```bash
curl http://localhost:3000/api/wallet/degens?limit=20
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wallet/chains` | GET | List all supported chains |
| `/api/wallet/wallets` | POST | Add wallet to track |
| `/api/wallet/wallets` | GET | Get all tracked wallets |
| `/api/wallet/balance/:address/:chain` | GET | Get balance on specific chain |
| `/api/wallet/balance/:address` | GET | Get balance across all chains |
| `/api/wallet/transactions/:address/:chain` | GET | Get transactions |
| `/api/wallet/analyze/:address/:chain` | POST | AI analysis of wallet |
| `/api/wallet/degens` | GET | Get degen wallets |
| `/api/wallet/high-risk` | GET | Get high-risk wallets |
| `/api/wallet/stats/:address/:chain` | GET | Wallet statistics |
| `/api/wallet/patterns/:address/:chain` | GET | Detected patterns |
| `/api/wallet/tokens/:address/:chain` | GET | Token transfers |
| `/api/wallet/dex/:address/:chain` | GET | DEX interactions |

See [API.md](docs/API.md) for complete API documentation.

## Database Schema

### Core Tables

- **wallets** - Tracked wallet addresses
- **transactions** - Transaction history across all chains
- **wallet_balance** - Balance snapshots
- **transaction_analysis** - AI analysis results
- **wallet_patterns** - Detected behavioral patterns
- **token_transfers** - Token transfer events
- **dex_interactions** - DEX trading activity

## AI Analysis Features

### Pattern Detection

The AI analyzer identifies:
- High-frequency trading patterns
- Degen trader behavior
- Arbitrage activity
- MEV bot operations
- Token sniping
- Risk levels (low/medium/high)

### Degen Detection Criteria

A wallet is classified as "degen" based on:
- Transaction frequency (>50 tx/day)
- DEX interaction ratio (>30%)
- Contract interaction patterns
- Multi-chain activity
- High failure rate (experimentation)

### Risk Scoring

Risk scores (0-1) are calculated from:
- Transaction volume
- Activity patterns
- Failure rates
- Multi-chain presence
- AI analysis results

## Supported Chains

| Chain | Type | Symbol | Explorer |
|-------|------|--------|----------|
| Ethereum | EVM | ETH | etherscan.io |
| Polygon | EVM | MATIC | polygonscan.com |
| BSC | EVM | BNB | bscscan.com |
| Arbitrum | EVM | ETH | arbiscan.io |
| Optimism | EVM | ETH | optimistic.etherscan.io |
| Avalanche | EVM | AVAX | snowtrace.io |
| Solana | Solana | SOL | solscan.io |
| Bitcoin | Bitcoin | BTC | blockchain.info |

## Development

### Running in Development Mode
```bash
npm run dev
```

### Project Structure

- `chains/` - Blockchain-specific adapters (EVM, Solana, Bitcoin)
- `ai/` - AI analysis and pattern detection modules
- `routes/` - Express API routes
- `db/` - Database queries and schema
- `config/` - Configuration and environment setup

## Performance & Scalability

- **Caching**: Chain adapters are cached to reduce initialization overhead
- **Database Indexing**: Optimized indexes on frequently queried fields
- **Batch Processing**: Efficient bulk transaction processing
- **Rate Limiting**: Built-in rate limiting for blockchain API calls

## Security Considerations

- Never commit API keys or sensitive data
- Use environment variables for all secrets
- Implement rate limiting in production
- Validate all wallet addresses before querying
- Use prepared statements for SQL queries (SQL injection protection)

## Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

**API Key Issues**
```bash
# Test API key (Etherscan example)
curl "https://api.etherscan.io/api?module=account&action=balance&address=0x...&apikey=YOUR_KEY"
```

**Solana Connection Issues**
- Use public RPC endpoints or get a dedicated RPC from providers like Helius or QuickNode

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License

## Roadmap

- [ ] WebSocket support for real-time updates
- [ ] NFT tracking
- [ ] DeFi protocol integration
- [ ] Advanced charting and visualization
- [ ] Telegram/Discord bot integration
- [ ] Portfolio management features
- [ ] Alert system for wallet activity
- [ ] Support for more chains (Cardano, Cosmos, etc.)

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Blockchain APIs: Etherscan, Polygonscan, BSCScan, etc.
- AI: Anthropic Claude
- Database: PostgreSQL
- Web framework: Express.js

---

Built with ❤️ for the blockchain community
