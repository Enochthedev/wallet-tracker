# Setup Guide

Complete guide for setting up the Multi-Chain Wallet Tracker.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Getting API Keys](#getting-api-keys)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** (v16 or higher)
  ```bash
  node --version  # Should be v16+
  ```

- **PostgreSQL** (v12 or higher)
  ```bash
  psql --version  # Should be v12+
  ```

- **npm** or **yarn**
  ```bash
  npm --version
  ```

### Optional

- **Git** - For version control
- **Docker** - For containerized deployment
- **PM2** - For production process management

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/wallet-tracker.git
cd wallet-tracker
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- `express` - Web framework
- `pg` - PostgreSQL client
- `axios` - HTTP client
- `@solana/web3.js` - Solana SDK
- `ethers` - Ethereum library
- `@anthropic-ai/sdk` - Claude AI SDK
- `cors` - CORS middleware
- `dotenv` - Environment variables
- And more...

---

## Database Setup

### 1. Create PostgreSQL Database

#### Using psql:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wallet_tracker;

# Create user (optional)
CREATE USER wallet_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE wallet_tracker TO wallet_user;

# Exit
\q
```

#### Using command line:
```bash
createdb wallet_tracker
```

### 2. Run Database Schema

```bash
psql wallet_tracker < db/schema.sql
```

Or connect and run:
```bash
psql -U postgres -d wallet_tracker -f db/schema.sql
```

### 3. Verify Tables

```bash
psql wallet_tracker
```

```sql
\dt  -- List all tables

-- You should see:
-- wallets
-- transactions
-- wallet_balance
-- transaction_analysis
-- wallet_patterns
-- token_transfers
-- dex_interactions
```

---

## Configuration

### 1. Create Environment File

```bash
cp .env.sample .env
```

### 2. Edit .env File

```bash
nano .env  # or use your preferred editor
```

### 3. Minimum Required Configuration

```env
# Server
PORT=3000
NODE_ENV=development

# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@localhost:5432/wallet_tracker

# At least one blockchain API key is recommended
ETHERSCAN_API_KEY=your_etherscan_key
```

### 4. Full Configuration Example

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://wallet_user:password@localhost:5432/wallet_tracker

# AI Configuration (Optional but recommended)
ANTHROPIC_API_KEY=sk-ant-api03-xxx
ENABLE_AI_ANALYSIS=true

# Blockchain API Keys
ETHERSCAN_API_KEY=ABC123XYZ
POLYGONSCAN_API_KEY=DEF456UVW
BSCSCAN_API_KEY=GHI789RST
ARBISCAN_API_KEY=JKL012MNO
OPTIMISM_API_KEY=PQR345STU
SNOWTRACE_API_KEY=VWX678YZA
SOLSCAN_API_KEY=BCD901EFG

# Custom RPC Endpoints (Optional)
ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/your-key
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/your-key
```

---

## Getting API Keys

### Blockchain Explorer API Keys

#### Etherscan (Ethereum)
1. Go to [etherscan.io/register](https://etherscan.io/register)
2. Create an account
3. Navigate to API-KEYs section
4. Create a new API key
5. Copy the key to `.env` file

#### Polygonscan (Polygon)
1. Visit [polygonscan.com](https://polygonscan.com)
2. Same process as Etherscan
3. Use the API key for `POLYGONSCAN_API_KEY`

#### BSCScan (Binance Smart Chain)
1. Visit [bscscan.com](https://bscscan.com)
2. Create account and get API key
3. Use for `BSCSCAN_API_KEY`

#### Other Chains
- **Arbiscan**: [arbiscan.io](https://arbiscan.io)
- **Optimism**: [optimistic.etherscan.io](https://optimistic.etherscan.io)
- **Snowtrace**: [snowtrace.io](https://snowtrace.io)

### AI API Key (Optional)

#### Anthropic Claude
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Get API key from settings
3. Add to `ANTHROPIC_API_KEY` in `.env`

**Note**: AI analysis is optional. The system falls back to rule-based analysis if no AI key is provided.

### RPC Providers (Optional)

For better performance, use dedicated RPC endpoints:

- **Alchemy**: [alchemy.com](https://www.alchemy.com)
- **Infura**: [infura.io](https://www.infura.io)
- **QuickNode**: [quicknode.com](https://www.quicknode.com)

---

## Running the Application

### Development Mode

```bash
npm run dev
```

This uses `nodemon` for auto-restart on file changes.

### Production Mode

```bash
npm start
```

### Verify Server is Running

```bash
curl http://localhost:3000/api/wallet/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Multi-Chain Wallet Tracker with AI Analysis",
  "version": "2.0.0"
}
```

---

## Testing

### 1. Test Database Connection

```bash
curl http://localhost:3000/api/wallet/health
```

### 2. Test Chain Support

```bash
curl http://localhost:3000/api/wallet/chains
```

### 3. Add a Test Wallet

```bash
curl -X POST http://localhost:3000/api/wallet/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chain": "ethereum",
    "label": "Test Wallet"
  }'
```

### 4. Get Balance

```bash
curl http://localhost:3000/api/wallet/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/ethereum
```

### 5. Test AI Analysis (if configured)

```bash
curl -X POST http://localhost:3000/api/wallet/analyze/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/ethereum
```

---

## Deployment

### Option 1: PM2 (Recommended for VPS)

#### Install PM2
```bash
npm install -g pm2
```

#### Start Application
```bash
pm2 start app.js --name wallet-tracker
```

#### Monitor
```bash
pm2 logs wallet-tracker
pm2 status
```

#### Auto-start on system reboot
```bash
pm2 startup
pm2 save
```

### Option 2: Docker

#### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/wallet_tracker
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=wallet_tracker
      - POSTGRES_PASSWORD=password
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  pgdata:
```

#### Run with Docker
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku
```bash
heroku create wallet-tracker
heroku addons:create heroku-postgresql
git push heroku main
```

#### Railway
1. Connect GitHub repository
2. Add PostgreSQL plugin
3. Set environment variables
4. Deploy

#### DigitalOcean App Platform
1. Connect repository
2. Configure build settings
3. Add managed PostgreSQL
4. Deploy

---

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/wallet_tracker
ENABLE_AI_ANALYSIS=false  # Save costs during development
```

### Staging
```env
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://staging-db-url
ENABLE_AI_ANALYSIS=true
```

### Production
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://production-db-url
ENABLE_AI_ANALYSIS=true
```

---

## Troubleshooting

### Database Connection Errors

**Error**: `connection refused`

**Solution**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check if you can connect
psql -U postgres -d wallet_tracker
```

**Error**: `password authentication failed`

**Solution**:
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL `pg_hba.conf` authentication settings

### API Key Errors

**Error**: `Invalid API key`

**Solution**:
- Verify API key in `.env` file
- Test API key directly:
  ```bash
  curl "https://api.etherscan.io/api?module=account&action=balance&address=0x...&apikey=YOUR_KEY"
  ```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Solana Connection Issues

**Error**: `Connection to solana RPC failed`

**Solution**:
- Use a dedicated RPC provider (Helius, QuickNode)
- Update `SOLANA_RPC` in `.env`:
  ```env
  SOLANA_RPC=https://your-dedicated-rpc.com
  ```

### Out of Memory

**Error**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Missing Dependencies

**Error**: `Cannot find module 'xxx'`

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Optimization

### Database Indexing

The schema includes indexes on:
- Transaction chain and addresses
- Wallet addresses and chains
- Transaction timestamps

### Caching

Consider adding Redis for caching:
```bash
npm install redis
```

### Load Balancing

For high traffic, use:
- NGINX reverse proxy
- Multiple app instances with PM2 cluster mode
- Database read replicas

---

## Security Best Practices

1. **Never commit `.env` file**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use environment variables for all secrets**

3. **Implement rate limiting** (production)
   ```bash
   npm install express-rate-limit
   ```

4. **Enable HTTPS in production**

5. **Regularly update dependencies**
   ```bash
   npm audit
   npm audit fix
   ```

---

## Monitoring & Logs

### PM2 Monitoring
```bash
pm2 logs wallet-tracker
pm2 monit
```

### Log Files
Configure log rotation in production:
```bash
pm2 install pm2-logrotate
```

### Health Checks
Set up automated health checks:
```bash
*/5 * * * * curl -f http://localhost:3000/api/wallet/health || systemctl restart wallet-tracker
```

---

## Backup & Recovery

### Database Backup
```bash
# Backup
pg_dump wallet_tracker > backup_$(date +%Y%m%d).sql

# Restore
psql wallet_tracker < backup_20240115.sql
```

### Automated Backups
```bash
# Add to crontab
0 2 * * * pg_dump wallet_tracker > /backups/wallet_tracker_$(date +\%Y\%m\%d).sql
```

---

## Next Steps

After setup:
1. Read the [API Documentation](API.md)
2. Check the [README](../README.md) for usage examples
3. Start tracking wallets!

---

## Support

For issues:
- Check this guide first
- Review error logs
- Open an issue on GitHub
- Contact support team
