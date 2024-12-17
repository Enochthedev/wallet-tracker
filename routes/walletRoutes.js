const express = require('express');
const fetchTransactions = require('../utils/fetchTransactions');
const fetchBalance = require('../utils/fetchBalance');
const { saveTransaction, getLatestTransactionHash, saveWalletBalance } = require('../db/queries');
const { WALLET_ADDRESS } = require('../config/config');

const router = express.Router();

// Endpoint: Get current wallet balance
router.get('/balance', async (req, res) => {
    try {
        const balance = await fetchBalance(WALLET_ADDRESS);
        await saveWalletBalance(balance);
        res.json({ wallet: WALLET_ADDRESS, balance: `${balance} ETH` });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching wallet balance.' });
    }
});

// Endpoint: Get latest transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await fetchTransactions(WALLET_ADDRESS);
        const latestStoredHash = await getLatestTransactionHash();

        const newTx = transactions.filter(tx => tx.hash !== latestStoredHash);
        res.json({ wallet: WALLET_ADDRESS, transactions: newTx });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions.' });
    }
});

// Endpoint: Health check
router.get('/health', (req, res) => {
    res.json({ status: 'Wallet Tracker API is healthy' });
});

module.exports = router;