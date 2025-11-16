const pool = require('../config/connectDB');

// ========== WALLET QUERIES ==========

async function addWallet(address, chain, label = null, isDegen = false, riskScore = 0) {
    const query = `
        INSERT INTO wallets (address, chain, label, is_degen, risk_score)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (address, chain) DO UPDATE
        SET label = $3, is_degen = $4, risk_score = $5
        RETURNING *;
    `;
    const res = await pool.query(query, [address, chain, label, isDegen, riskScore]);
    return res.rows[0];
}

async function getWallet(address, chain) {
    const query = `SELECT * FROM wallets WHERE address = $1 AND chain = $2`;
    const res = await pool.query(query, [address, chain]);
    return res.rows[0] || null;
}

async function getAllWallets() {
    const query = `SELECT * FROM wallets ORDER BY created_at DESC`;
    const res = await pool.query(query);
    return res.rows;
}

async function updateWalletRiskScore(address, chain, riskScore, isDegen) {
    const query = `
        UPDATE wallets
        SET risk_score = $3, is_degen = $4
        WHERE address = $1 AND chain = $2
        RETURNING *;
    `;
    const res = await pool.query(query, [address, chain, riskScore, isDegen]);
    return res.rows[0];
}

// ========== TRANSACTION QUERIES ==========

async function saveTransaction(txData) {
    const query = `
        INSERT INTO transactions (
            hash, chain, from_address, to_address, value, token_symbol,
            token_address, gas_used, gas_price, block_number,
            transaction_type, contract_address, method_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (hash, chain) DO NOTHING
        RETURNING *;
    `;
    const res = await pool.query(query, [
        txData.hash, txData.chain, txData.from, txData.to,
        txData.value, txData.tokenSymbol || 'native', txData.tokenAddress,
        txData.gasUsed, txData.gasPrice, txData.blockNumber,
        txData.transactionType, txData.contractAddress, txData.methodId
    ]);
    return res.rows[0];
}

async function getTransactionsByWallet(address, chain, limit = 100) {
    const query = `
        SELECT * FROM transactions
        WHERE (from_address = $1 OR to_address = $1) AND chain = $2
        ORDER BY timestamp DESC
        LIMIT $3
    `;
    const res = await pool.query(query, [address, chain, limit]);
    return res.rows;
}

async function getLatestTransaction(address, chain) {
    const query = `
        SELECT * FROM transactions
        WHERE (from_address = $1 OR to_address = $1) AND chain = $2
        ORDER BY timestamp DESC
        LIMIT 1
    `;
    const res = await pool.query(query, [address, chain]);
    return res.rows[0] || null;
}

async function getTransactionsByChain(chain, limit = 100) {
    const query = `
        SELECT * FROM transactions
        WHERE chain = $1
        ORDER BY timestamp DESC
        LIMIT $2
    `;
    const res = await pool.query(query, [chain, limit]);
    return res.rows;
}

// ========== BALANCE QUERIES ==========

async function saveWalletBalance(address, chain, balance, tokenSymbol = 'native', usdValue = null) {
    const query = `
        INSERT INTO wallet_balance (wallet_address, chain, balance, token_symbol, usd_value)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const res = await pool.query(query, [address, chain, balance, tokenSymbol, usdValue]);
    return res.rows[0];
}

async function getLatestBalance(address, chain) {
    const query = `
        SELECT * FROM wallet_balance
        WHERE wallet_address = $1 AND chain = $2
        ORDER BY updated_at DESC
        LIMIT 1
    `;
    const res = await pool.query(query, [address, chain]);
    return res.rows[0] || null;
}

async function getBalanceHistory(address, chain, limit = 100) {
    const query = `
        SELECT * FROM wallet_balance
        WHERE wallet_address = $1 AND chain = $2
        ORDER BY updated_at DESC
        LIMIT $3
    `;
    const res = await pool.query(query, [address, chain, limit]);
    return res.rows;
}

// ========== AI ANALYSIS QUERIES ==========

async function saveTransactionAnalysis(hash, chain, analysisData) {
    const query = `
        INSERT INTO transaction_analysis (
            transaction_hash, chain, analysis_type, pattern_detected,
            risk_level, confidence_score, insights
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const res = await pool.query(query, [
        hash, chain, analysisData.analysis_type || 'ai_analysis',
        analysisData.pattern_detected, analysisData.risk_level,
        analysisData.confidence_score, JSON.stringify(analysisData.insights)
    ]);
    return res.rows[0];
}

async function getTransactionAnalysis(hash, chain) {
    const query = `
        SELECT * FROM transaction_analysis
        WHERE transaction_hash = $1 AND chain = $2
        ORDER BY analyzed_at DESC
        LIMIT 1
    `;
    const res = await pool.query(query, [hash, chain]);
    return res.rows[0] || null;
}

// ========== WALLET PATTERN QUERIES ==========

async function saveWalletPattern(address, chain, patternData) {
    const query = `
        INSERT INTO wallet_patterns (
            wallet_address, chain, pattern_type, frequency,
            avg_transaction_value, total_volume, dex_interactions,
            nft_trades, high_risk_interactions, last_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (wallet_address, chain, pattern_type)
        DO UPDATE SET
            frequency = $4,
            avg_transaction_value = $5,
            total_volume = $6,
            dex_interactions = $7,
            nft_trades = $8,
            high_risk_interactions = $9,
            last_active = $10,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;
    const res = await pool.query(query, [
        address, chain, patternData.pattern_type || 'general',
        patternData.frequency || 0, patternData.avg_transaction_value || 0,
        patternData.total_volume || 0, patternData.dex_interactions || 0,
        patternData.nft_trades || 0, patternData.high_risk_interactions || 0,
        patternData.last_active || new Date()
    ]);
    return res.rows[0];
}

async function getWalletPatterns(address, chain) {
    const query = `
        SELECT * FROM wallet_patterns
        WHERE wallet_address = $1 AND chain = $2
        ORDER BY updated_at DESC
    `;
    const res = await pool.query(query, [address, chain]);
    return res.rows;
}

// ========== TOKEN TRANSFER QUERIES ==========

async function saveTokenTransfer(transferData) {
    const query = `
        INSERT INTO token_transfers (
            transaction_hash, chain, from_address, to_address,
            token_address, token_name, token_symbol, amount,
            usd_value, transfer_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `;
    const res = await pool.query(query, [
        transferData.hash, transferData.chain, transferData.from,
        transferData.to, transferData.tokenAddress, transferData.tokenName,
        transferData.tokenSymbol, transferData.amount, transferData.usdValue,
        transferData.transferType
    ]);
    return res.rows[0];
}

async function getTokenTransfersByWallet(address, chain, limit = 100) {
    const query = `
        SELECT * FROM token_transfers
        WHERE (from_address = $1 OR to_address = $1) AND chain = $2
        ORDER BY timestamp DESC
        LIMIT $3
    `;
    const res = await pool.query(query, [address, chain, limit]);
    return res.rows;
}

// ========== DEX INTERACTION QUERIES ==========

async function saveDEXInteraction(dexData) {
    const query = `
        INSERT INTO dex_interactions (
            transaction_hash, chain, wallet_address, dex_name,
            action_type, token_in, token_out, amount_in,
            amount_out, price_impact
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `;
    const res = await pool.query(query, [
        dexData.hash, dexData.chain, dexData.walletAddress, dexData.dexName,
        dexData.actionType, dexData.tokenIn, dexData.tokenOut,
        dexData.amountIn, dexData.amountOut, dexData.priceImpact
    ]);
    return res.rows[0];
}

async function getDEXInteractionsByWallet(address, chain, limit = 100) {
    const query = `
        SELECT * FROM dex_interactions
        WHERE wallet_address = $1 AND chain = $2
        ORDER BY timestamp DESC
        LIMIT $3
    `;
    const res = await pool.query(query, [address, chain, limit]);
    return res.rows;
}

// ========== ANALYTICS QUERIES ==========

async function getWalletStats(address, chain) {
    const query = `
        SELECT
            COUNT(*) as total_transactions,
            SUM(value) as total_volume,
            AVG(value) as avg_transaction_value,
            MAX(value) as max_transaction_value,
            MIN(timestamp) as first_transaction,
            MAX(timestamp) as last_transaction
        FROM transactions
        WHERE (from_address = $1 OR to_address = $1) AND chain = $2
    `;
    const res = await pool.query(query, [address, chain]);
    return res.rows[0];
}

async function getDegenWallets(limit = 50) {
    const query = `
        SELECT * FROM wallets
        WHERE is_degen = true
        ORDER BY risk_score DESC
        LIMIT $1
    `;
    const res = await pool.query(query, [limit]);
    return res.rows;
}

async function getHighRiskWallets(riskThreshold = 0.7, limit = 50) {
    const query = `
        SELECT * FROM wallets
        WHERE risk_score > $1
        ORDER BY risk_score DESC
        LIMIT $2
    `;
    const res = await pool.query(query, [riskThreshold, limit]);
    return res.rows;
}

module.exports = {
    // Wallet functions
    addWallet,
    getWallet,
    getAllWallets,
    updateWalletRiskScore,

    // Transaction functions
    saveTransaction,
    getTransactionsByWallet,
    getLatestTransaction,
    getTransactionsByChain,

    // Balance functions
    saveWalletBalance,
    getLatestBalance,
    getBalanceHistory,

    // AI Analysis functions
    saveTransactionAnalysis,
    getTransactionAnalysis,

    // Pattern functions
    saveWalletPattern,
    getWalletPatterns,

    // Token transfer functions
    saveTokenTransfer,
    getTokenTransfersByWallet,

    // DEX interaction functions
    saveDEXInteraction,
    getDEXInteractionsByWallet,

    // Analytics functions
    getWalletStats,
    getDegenWallets,
    getHighRiskWallets
};