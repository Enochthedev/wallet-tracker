const express = require('express');
const ChainFactory = require('../chains/chainFactory');
const TransactionAnalyzer = require('../ai/transactionAnalyzer');
const WalletPatternDetector = require('../ai/walletPatternDetector');
const {
    addWallet,
    getWallet,
    getAllWallets,
    saveTransaction,
    getTransactionsByWallet,
    getLatestTransaction,
    saveWalletBalance,
    getLatestBalance,
    getBalanceHistory,
    saveTransactionAnalysis,
    getTransactionAnalysis,
    saveWalletPattern,
    getWalletPatterns,
    getTokenTransfersByWallet,
    getDEXInteractionsByWallet,
    getWalletStats,
    getDegenWallets,
    getHighRiskWallets,
    updateWalletRiskScore
} = require('../db/queries');
const { CHAINS } = require('../config/config');

const router = express.Router();
const analyzer = new TransactionAnalyzer();

// ========== WALLET MANAGEMENT ENDPOINTS ==========

// Add a wallet to track
router.post('/wallets', async (req, res) => {
    try {
        const { address, chain, label } = req.body;

        if (!address || !chain) {
            return res.status(400).json({ error: 'Address and chain are required' });
        }

        if (!CHAINS[chain]) {
            return res.status(400).json({ error: `Unsupported chain: ${chain}` });
        }

        const wallet = await addWallet(address, chain, label);
        res.json({ success: true, wallet });
    } catch (error) {
        console.error('Error adding wallet:', error);
        res.status(500).json({ error: 'Error adding wallet' });
    }
});

// Get all tracked wallets
router.get('/wallets', async (req, res) => {
    try {
        const wallets = await getAllWallets();
        res.json({ success: true, count: wallets.length, wallets });
    } catch (error) {
        console.error('Error fetching wallets:', error);
        res.status(500).json({ error: 'Error fetching wallets' });
    }
});

// Get specific wallet info
router.get('/wallets/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;
        const wallet = await getWallet(address, chain);

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json({ success: true, wallet });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ error: 'Error fetching wallet' });
    }
});

// ========== BALANCE ENDPOINTS ==========

// Get balance for a wallet on a specific chain
router.get('/balance/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;

        if (!CHAINS[chain]) {
            return res.status(400).json({ error: `Unsupported chain: ${chain}` });
        }

        const adapter = ChainFactory.getAdapter(chain);
        const balanceData = await adapter.getBalance(address);

        // Save balance to database
        await saveWalletBalance(
            address,
            chain,
            balanceData.balance,
            balanceData.symbol
        );

        res.json({
            success: true,
            address,
            chain,
            balance: balanceData.balance,
            symbol: balanceData.symbol
        });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Error fetching balance' });
    }
});

// Get balance across all chains
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const balances = await ChainFactory.getMultiChainBalance(address);

        res.json({
            success: true,
            address,
            balances
        });
    } catch (error) {
        console.error('Error fetching multi-chain balance:', error);
        res.status(500).json({ error: 'Error fetching multi-chain balance' });
    }
});

// Get balance history
router.get('/balance-history/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const history = await getBalanceHistory(address, chain, limit);

        res.json({
            success: true,
            address,
            chain,
            count: history.length,
            history
        });
    } catch (error) {
        console.error('Error fetching balance history:', error);
        res.status(500).json({ error: 'Error fetching balance history' });
    }
});

// ========== TRANSACTION ENDPOINTS ==========

// Get transactions for a wallet on a specific chain
router.get('/transactions/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const fetchNew = req.query.fetchNew === 'true';

        if (!CHAINS[chain]) {
            return res.status(400).json({ error: `Unsupported chain: ${chain}` });
        }

        let transactions;

        if (fetchNew) {
            // Fetch from blockchain
            const adapter = ChainFactory.getAdapter(chain);
            const txs = await adapter.getTransactions(address, limit);

            // Save to database
            for (const tx of txs) {
                await saveTransaction(tx);
            }

            transactions = txs;
        } else {
            // Get from database
            transactions = await getTransactionsByWallet(address, chain, limit);
        }

        res.json({
            success: true,
            address,
            chain,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

// Get transactions across all chains
router.get('/transactions/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const limit = parseInt(req.query.limit) || 50;

        const transactions = await ChainFactory.getMultiChainTransactions(address, limit);

        res.json({
            success: true,
            address,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.error('Error fetching multi-chain transactions:', error);
        res.status(500).json({ error: 'Error fetching multi-chain transactions' });
    }
});

// ========== AI ANALYSIS ENDPOINTS ==========

// Analyze wallet behavior
router.post('/analyze/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;

        // Get wallet and transactions
        let wallet = await getWallet(address, chain);
        if (!wallet) {
            wallet = await addWallet(address, chain);
        }

        const transactions = await getTransactionsByWallet(address, chain, 100);

        if (transactions.length === 0) {
            // Fetch transactions first
            const adapter = ChainFactory.getAdapter(chain);
            const txs = await adapter.getTransactions(address, 100);

            for (const tx of txs) {
                await saveTransaction(tx);
            }

            transactions.push(...txs);
        }

        // Run AI analysis
        const aiAnalysis = await analyzer.analyzeTransactions(transactions);

        // Detect patterns
        const patternDetection = WalletPatternDetector.detectDegenBehavior(
            wallet,
            transactions
        );

        // Calculate metrics
        const metrics = WalletPatternDetector.calculateMetrics(transactions);

        // Save pattern data
        if (metrics) {
            await saveWalletPattern(address, chain, {
                pattern_type: aiAnalysis?.pattern_detected || 'general',
                frequency: metrics.totalTransactions,
                avg_transaction_value: metrics.avgTxValue,
                total_volume: metrics.totalVolume,
                dex_interactions: metrics.contractInteractions,
                last_active: new Date()
            });
        }

        // Update wallet risk score
        const riskScore = WalletPatternDetector.calculateRiskScore(
            { ...metrics, degenScore: patternDetection.degenScore },
            aiAnalysis
        );

        await updateWalletRiskScore(
            address,
            chain,
            riskScore,
            patternDetection.isDegen
        );

        res.json({
            success: true,
            address,
            chain,
            analysis: {
                ai: aiAnalysis,
                patterns: patternDetection,
                metrics,
                riskScore,
                isDegen: patternDetection.isDegen
            }
        });
    } catch (error) {
        console.error('Error analyzing wallet:', error);
        res.status(500).json({ error: 'Error analyzing wallet' });
    }
});

// Get wallet patterns
router.get('/patterns/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;
        const patterns = await getWalletPatterns(address, chain);

        res.json({
            success: true,
            address,
            chain,
            count: patterns.length,
            patterns
        });
    } catch (error) {
        console.error('Error fetching patterns:', error);
        res.status(500).json({ error: 'Error fetching patterns' });
    }
});

// ========== DEGEN WALLET ENDPOINTS ==========

// Get all degen wallets
router.get('/degens', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const degens = await getDegenWallets(limit);

        res.json({
            success: true,
            count: degens.length,
            degens
        });
    } catch (error) {
        console.error('Error fetching degen wallets:', error);
        res.status(500).json({ error: 'Error fetching degen wallets' });
    }
});

// Get high-risk wallets
router.get('/high-risk', async (req, res) => {
    try {
        const threshold = parseFloat(req.query.threshold) || 0.7;
        const limit = parseInt(req.query.limit) || 50;

        const highRisk = await getHighRiskWallets(threshold, limit);

        res.json({
            success: true,
            count: highRisk.length,
            threshold,
            wallets: highRisk
        });
    } catch (error) {
        console.error('Error fetching high-risk wallets:', error);
        res.status(500).json({ error: 'Error fetching high-risk wallets' });
    }
});

// ========== STATISTICS ENDPOINTS ==========

// Get wallet statistics
router.get('/stats/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;
        const stats = await getWalletStats(address, chain);

        res.json({
            success: true,
            address,
            chain,
            stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

// Get token transfers
router.get('/tokens/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const transfers = await getTokenTransfersByWallet(address, chain, limit);

        res.json({
            success: true,
            address,
            chain,
            count: transfers.length,
            transfers
        });
    } catch (error) {
        console.error('Error fetching token transfers:', error);
        res.status(500).json({ error: 'Error fetching token transfers' });
    }
});

// Get DEX interactions
router.get('/dex/:address/:chain', async (req, res) => {
    try {
        const { address, chain } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const dexInteractions = await getDEXInteractionsByWallet(address, chain, limit);

        res.json({
            success: true,
            address,
            chain,
            count: dexInteractions.length,
            interactions: dexInteractions
        });
    } catch (error) {
        console.error('Error fetching DEX interactions:', error);
        res.status(500).json({ error: 'Error fetching DEX interactions' });
    }
});

// ========== UTILITY ENDPOINTS ==========

// Get supported chains
router.get('/chains', (req, res) => {
    const chains = ChainFactory.getSupportedChains().map(key => ({
        key,
        ...CHAINS[key]
    }));

    res.json({
        success: true,
        count: chains.length,
        chains
    });
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Multi-Chain Wallet Tracker with AI Analysis',
        version: '2.0.0',
        features: [
            'Multi-chain support (8 chains)',
            'AI-powered transaction analysis',
            'Degen wallet detection',
            'Pattern recognition',
            'Risk scoring'
        ]
    });
});

module.exports = router;