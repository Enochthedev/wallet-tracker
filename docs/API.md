# API Documentation

## Base URL
```
http://localhost:3000/api/wallet
```

## Authentication
Currently no authentication required. In production, implement API key authentication.

---

## Endpoints

### General

#### GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "Multi-Chain Wallet Tracker with AI Analysis",
  "version": "2.0.0",
  "features": [
    "Multi-chain support (8 chains)",
    "AI-powered transaction analysis",
    "Degen wallet detection",
    "Pattern recognition",
    "Risk scoring"
  ]
}
```

#### GET `/chains`
Get list of supported blockchain networks

**Response:**
```json
{
  "success": true,
  "count": 8,
  "chains": [
    {
      "key": "ethereum",
      "name": "Ethereum",
      "symbol": "ETH",
      "chainId": 1,
      "type": "evm"
    }
    // ... more chains
  ]
}
```

---

### Wallet Management

#### POST `/wallets`
Add a new wallet to track

**Request Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "label": "Vitalik's Wallet"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": 1,
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chain": "ethereum",
    "label": "Vitalik's Wallet",
    "is_degen": false,
    "risk_score": 0,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET `/wallets`
Get all tracked wallets

**Response:**
```json
{
  "success": true,
  "count": 10,
  "wallets": [
    {
      "id": 1,
      "address": "0x...",
      "chain": "ethereum",
      "label": "Wallet 1",
      "is_degen": false,
      "risk_score": 0.45
    }
    // ... more wallets
  ]
}
```

#### GET `/wallets/:address/:chain`
Get specific wallet information

**Parameters:**
- `address` - Wallet address
- `chain` - Blockchain network (ethereum, polygon, bsc, etc.)

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": 1,
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chain": "ethereum",
    "label": "Vitalik's Wallet",
    "is_degen": false,
    "risk_score": 0.23,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Balance Endpoints

#### GET `/balance/:address/:chain`
Get wallet balance on a specific chain

**Parameters:**
- `address` - Wallet address
- `chain` - Blockchain network

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "balance": 1234.56,
  "symbol": "ETH"
}
```

#### GET `/balance/:address`
Get wallet balance across all supported chains

**Parameters:**
- `address` - Wallet address

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "balances": [
    {
      "balance": 1234.56,
      "symbol": "ETH",
      "chain": "ethereum"
    },
    {
      "balance": 567.89,
      "symbol": "MATIC",
      "chain": "polygon"
    }
    // ... more chains
  ]
}
```

#### GET `/balance-history/:address/:chain`
Get historical balance snapshots

**Parameters:**
- `address` - Wallet address
- `chain` - Blockchain network
- `limit` - (Query param) Number of records (default: 100)

**Example:**
```
GET /balance-history/0x742d35Cc.../ethereum?limit=50
```

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "count": 50,
  "history": [
    {
      "balance": 1234.56,
      "token_symbol": "ETH",
      "usd_value": 2469120.00,
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
    // ... more snapshots
  ]
}
```

---

### Transaction Endpoints

#### GET `/transactions/:address/:chain`
Get transaction history for a wallet

**Parameters:**
- `address` - Wallet address
- `chain` - Blockchain network
- `limit` - (Query param) Number of transactions (default: 50)
- `fetchNew` - (Query param) Fetch from blockchain vs database (default: false)

**Example:**
```
GET /transactions/0x742d35Cc.../ethereum?limit=100&fetchNew=true
```

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "count": 100,
  "transactions": [
    {
      "hash": "0xabc123...",
      "chain": "ethereum",
      "from": "0x123...",
      "to": "0x456...",
      "value": 1.5,
      "gasUsed": 21000,
      "gasPrice": 50.5,
      "blockNumber": 12345678,
      "timestamp": "2024-01-15T10:30:00.000Z",
      "transactionType": "transfer"
    }
    // ... more transactions
  ]
}
```

#### GET `/transactions/:address`
Get transactions across all chains

**Parameters:**
- `address` - Wallet address
- `limit` - (Query param) Total number of transactions (default: 50)

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "count": 150,
  "transactions": [
    // Transactions from all chains, sorted by timestamp
  ]
}
```

---

### AI Analysis Endpoints

#### POST `/analyze/:address/:chain`
Analyze wallet behavior with AI

**Parameters:**
- `address` - Wallet address
- `chain` - Blockchain network

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "analysis": {
    "ai": {
      "pattern_detected": "high_frequency_trading",
      "risk_level": "medium",
      "confidence_score": 0.85,
      "is_degen": true,
      "sophistication_level": "advanced",
      "insights": {
        "tradingStyle": "Aggressive DeFi trader with high DEX activity",
        "riskFactors": [
          "High transaction frequency",
          "Multiple DEX interactions"
        ],
        "strengths": [
          "Diverse protocol usage",
          "Multi-chain presence"
        ],
        "recommendations": [
          "Monitor for high-risk contract interactions",
          "Track gas optimization patterns"
        ]
      }
    },
    "patterns": {
      "isDegen": true,
      "degenScore": 0.75,
      "classification": {
        "type": "active_degen",
        "description": "Active DeFi user with elevated risk tolerance"
      },
      "warnings": [
        {
          "severity": "medium",
          "message": "High transaction frequency detected"
        }
      ]
    },
    "metrics": {
      "totalTransactions": 250,
      "txLast24h": 45,
      "totalVolume": 1500.5,
      "avgTxValue": 6.0,
      "contractInteractionRate": 0.68,
      "uniqueContracts": 28,
      "chainDiversity": 3
    },
    "riskScore": 0.67,
    "isDegen": true
  }
}
```

#### GET `/patterns/:address/:chain`
Get detected behavioral patterns for a wallet

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "count": 3,
  "patterns": [
    {
      "pattern_type": "high_frequency_trading",
      "frequency": 250,
      "avg_transaction_value": 6.0,
      "total_volume": 1500.5,
      "dex_interactions": 170,
      "last_active": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Degen & Risk Endpoints

#### GET `/degens`
Get all wallets classified as "degen"

**Query Parameters:**
- `limit` - Number of results (default: 50)

**Example:**
```
GET /degens?limit=20
```

**Response:**
```json
{
  "success": true,
  "count": 20,
  "degens": [
    {
      "address": "0x123...",
      "chain": "ethereum",
      "label": "Degen Trader #1",
      "is_degen": true,
      "risk_score": 0.89,
      "created_at": "2024-01-10T10:30:00.000Z"
    }
    // ... more degen wallets
  ]
}
```

#### GET `/high-risk`
Get high-risk wallets

**Query Parameters:**
- `threshold` - Minimum risk score (default: 0.7)
- `limit` - Number of results (default: 50)

**Example:**
```
GET /high-risk?threshold=0.8&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "threshold": 0.8,
  "wallets": [
    {
      "address": "0x456...",
      "chain": "ethereum",
      "risk_score": 0.92,
      "is_degen": true
    }
    // ... more high-risk wallets
  ]
}
```

---

### Statistics & Analytics

#### GET `/stats/:address/:chain`
Get comprehensive wallet statistics

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "stats": {
    "total_transactions": "250",
    "total_volume": "1500.5",
    "avg_transaction_value": "6.002",
    "max_transaction_value": "150.0",
    "first_transaction": "2023-01-01T00:00:00.000Z",
    "last_transaction": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET `/tokens/:address/:chain`
Get token transfer history

**Query Parameters:**
- `limit` - Number of transfers (default: 100)

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "count": 50,
  "transfers": [
    {
      "transaction_hash": "0xabc...",
      "from_address": "0x123...",
      "to_address": "0x456...",
      "token_address": "0x789...",
      "token_name": "Wrapped Ether",
      "token_symbol": "WETH",
      "amount": 10.5,
      "usd_value": 21000.0,
      "transfer_type": "ERC20",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
    // ... more transfers
  ]
}
```

#### GET `/dex/:address/:chain`
Get DEX interaction history

**Query Parameters:**
- `limit` - Number of interactions (default: 100)

**Response:**
```json
{
  "success": true,
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "chain": "ethereum",
  "count": 30,
  "interactions": [
    {
      "transaction_hash": "0xdef...",
      "dex_name": "Uniswap V3",
      "action_type": "swap",
      "token_in": "WETH",
      "token_out": "USDC",
      "amount_in": 1.5,
      "amount_out": 3000.0,
      "price_impact": 0.02,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
    // ... more DEX interactions
  ]
}
```

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "error": "Address and chain are required"
}
```

### 404 Not Found
```json
{
  "error": "Wallet not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error fetching balance"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. In production:
- Implement rate limiting per IP
- Consider API key-based quotas
- Cache frequently accessed data

---

## Supported Chain Values

Use these values for the `chain` parameter:
- `ethereum`
- `polygon`
- `bsc`
- `arbitrum`
- `optimism`
- `avalanche`
- `solana`
- `bitcoin`

---

## Best Practices

1. **Caching**: Cache responses for frequently accessed wallets
2. **Pagination**: Use `limit` parameter to control response size
3. **Batch Requests**: For multiple wallets, use multi-chain endpoints
4. **Error Handling**: Always check `success` field in response
5. **Address Validation**: Validate addresses before making requests

---

## Examples with curl

### Track a new wallet
```bash
curl -X POST http://localhost:3000/api/wallet/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chain": "ethereum",
    "label": "Vitalik"
  }'
```

### Get multi-chain balance
```bash
curl http://localhost:3000/api/wallet/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Analyze wallet with AI
```bash
curl -X POST http://localhost:3000/api/wallet/analyze/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/ethereum
```

### Get degen wallets
```bash
curl http://localhost:3000/api/wallet/degens?limit=10
```

---

## WebSocket Support (Planned)

Future versions will include WebSocket support for real-time updates:
- Live transaction notifications
- Balance change alerts
- Degen wallet activity streams
