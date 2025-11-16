const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/config');
const walletRoutes = require('./routes/walletRoutes');
const { connectDB } = require('./config/connectDB');

// Connect to PostgreSQL
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/wallet', walletRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Multi-Chain Wallet Tracker',
        version: '2.0.0',
        description: 'Track wallets across multiple blockchains with AI-powered analysis',
        features: [
            'Multi-chain support (Ethereum, Polygon, BSC, Arbitrum, Optimism, Avalanche, Solana, Bitcoin)',
            'AI-powered transaction analysis',
            'Degen wallet detection',
            'Pattern recognition',
            'Risk scoring',
            'DEX interaction tracking'
        ],
        endpoints: {
            health: '/api/wallet/health',
            chains: '/api/wallet/chains',
            wallets: '/api/wallet/wallets',
            balance: '/api/wallet/balance/:address/:chain',
            transactions: '/api/wallet/transactions/:address/:chain',
            analyze: '/api/wallet/analyze/:address/:chain',
            degens: '/api/wallet/degens'
        },
        documentation: '/api/docs'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.path} not found`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   Multi-Chain Wallet Tracker v2.0.0                  ║
╠═══════════════════════════════════════════════════════╣
║   🚀 Server running on http://localhost:${PORT}       ║
║   🔗 Supported chains: 8                             ║
║   🤖 AI Analysis: Enabled                            ║
║   📊 Features: Degen detection, Risk scoring         ║
╚═══════════════════════════════════════════════════════╝
    `);
});