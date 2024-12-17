require('dotenv').config();

module.exports = {
    APE_API_KEY: process.env.APESCAN_API_KEY,
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    BASE_URL_APE: 'https://api.apescan.io/api',
    BASE_URL_ETHERSCAN: 'https://api.etherscan.io/api',
    WALLET_ADDRESS: '0x448E859EA904E8f3485a6Fd8e900fC0C3Bd96F78', // Replace with your wallet
    WALLET_PORT: process.env.PORT || 3000,
};