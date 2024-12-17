const axios = require('axios');
const { APE_API_KEY, BASE_URL_APE} = require('../config/config');

// Fetch transactions for a given wallet address
async function fetchTransactions(walletAddress) {
    try {
        const response = await axios.get(BASE_URL_APE, {
            params: {
                module: 'account',
                action: 'txlist',
                address: walletAddress,
                startblock: 0,
                endblock: 99999999,
                sort: 'desc',
                apikey: APE_API_KEY,
            },
        });
        return response.data.result || [];
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        return [];
    }
}

module.exports = fetchTransactions;