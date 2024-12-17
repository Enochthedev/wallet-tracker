const fetchTransactions = require('../utils/fetchTransactions');
const fetchBalance = require('../utils/fetchBalance');
const { saveTransaction, getLatestTransactionHash, saveWalletBalance } = require('../db/queries');
const { WALLET_ADDRESS } = require('../config/config');

async function checkWalletForFunds() {
    console.log(`\n🔎 Checking wallet: ${WALLET_ADDRESS}...`);

    // Fetch wallet balance
    const currentBalance = await fetchBalance(WALLET_ADDRESS);
    await saveWalletBalance(currentBalance);
    console.log(`💰 Current Balance: ${currentBalance} ETH`);

    // Fetch wallet transactions
    const latestStoredHash = await getLatestTransactionHash();
    const transactions = await fetchTransactions(WALLET_ADDRESS);

    if (transactions.length > 0) {
        const latestTx = transactions[0];

        if (latestTx.hash !== latestStoredHash) {
            console.log('\n🚨 New funding detected! 🚨');
            console.log(`Transaction Hash: ${latestTx.hash}`);
            console.log(`From: ${latestTx.from}`);
            console.log(`To: ${latestTx.to}`);
            console.log(`Value: ${latestTx.value / 1e18} ETH`);

            // Save new transaction
            await saveTransaction(
                latestTx.hash,
                latestTx.from,
                latestTx.to,
                latestTx.value / 1e18
            );
        } else {
            console.log('✅ No new transactions.');
        }
    } else {
        console.log('🚫 No transactions found.');
    }
}

module.exports = checkWalletForFunds;