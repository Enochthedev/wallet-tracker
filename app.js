const express = require('express');
const { WALLET_PORT } = require('./config/config');
const walletRoutes = require('./routes/walletRoutes');
const { connectDB } = require('./config/connectDB');

// Connect to PostgreSQL
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/wallet', walletRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('🚀 Wallet Tracker Service is Running!');
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${WALLET_PORT}`);
});