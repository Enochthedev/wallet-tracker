const axios = require('axios');
const { APE_API_KEY, BASE_URL_APE } = require('../config/config');

// Fetch wallet balance
async function fetchBalance(walletAddress) {
    try {
        const response = await axios.get(BASE_URL_APE, {
            params: {
                module: 'account',
                action: 'balance',
                address: walletAddress,
                tag: 'latest',
                apikey: APE_API_KEY,
            },
        });

        // Return balance in ETH (1 ETH = 10^18 Wei)
        const balanceWei = response.data.result;
        return balanceWei / 1e18; // Convert from Wei to ETH
    } catch (error) {
        console.error('Error fetching balance:', error.message);
        return 0; // Return 0 on error
    }
}

module.exports = fetchBalance;