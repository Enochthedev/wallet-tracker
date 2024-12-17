const pool = require('../config/connectDB');

// Save a transaction
async function saveTransaction(hash, fromAddress, toAddress, value) {
    const query = `
        INSERT INTO transactions (hash, from_address, to_address, value)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (hash) DO NOTHING;
    `;
    await pool.query(query, [hash, fromAddress, toAddress, value]);
}

// Get the latest transaction hash
async function getLatestTransactionHash() {
    const query = `SELECT hash FROM transactions ORDER BY timestamp DESC LIMIT 1`;
    const res = await pool.query(query);
    return res.rows[0]?.hash || null;
}

// Save wallet balance
async function saveWalletBalance(balance) {
    const query = `INSERT INTO wallet_balance (balance) VALUES ($1)`;
    await pool.query(query, [balance]);
}

module.exports = { saveTransaction, getLatestTransactionHash, saveWalletBalance };