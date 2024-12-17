const axios = require('axios');
const { ETHERSCAN_API_KEY, BASE_URL_ETHERSCAN } = require('../config/config');

// Fetch current gas fee from an API
async function fetchGasFee() {
    try {
        const response = await axios.get(BASE_URL_ETHERSCAN, {
            params: {
                module: 'gastracker',
                action: 'gasoracle',
                apikey: ETHERSCAN_API_KEY,
            },
        });

        const { SafeGasPrice, ProposeGasPrice, FastGasPrice } = response.data.result;
        return {
            safe: SafeGasPrice,
            average: ProposeGasPrice,
            fast: FastGasPrice,
        };
    } catch (error) {
        console.error('Error fetching gas fees:', error.message);
        return { safe: 0, average: 0, fast: 0 };
    }
}

module.exports = fetchGasFee;