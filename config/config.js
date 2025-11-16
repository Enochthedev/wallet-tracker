require('dotenv').config();

module.exports = {
    // Server config
    PORT: process.env.PORT || 3000,

    // AI Configuration
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,

    // Blockchain API Keys
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
    POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY,
    BSCSCAN_API_KEY: process.env.BSCSCAN_API_KEY,
    ARBISCAN_API_KEY: process.env.ARBISCAN_API_KEY,
    OPTIMISM_API_KEY: process.env.OPTIMISM_API_KEY,
    SNOWTRACE_API_KEY: process.env.SNOWTRACE_API_KEY,
    SOLSCAN_API_KEY: process.env.SOLSCAN_API_KEY,
    BLOCKCHAIN_INFO_API_KEY: process.env.BLOCKCHAIN_INFO_API_KEY,

    // RPC Endpoints
    RPC_ENDPOINTS: {
        ethereum: process.env.ETHEREUM_RPC || 'https://eth.llamarpc.com',
        polygon: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
        bsc: process.env.BSC_RPC || 'https://bsc-dataseed.binance.org',
        arbitrum: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
        optimism: process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io',
        avalanche: process.env.AVALANCHE_RPC || 'https://api.avax.network/ext/bc/C/rpc',
        solana: process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
    },

    // Chain Configurations
    CHAINS: {
        ethereum: {
            name: 'Ethereum',
            symbol: 'ETH',
            chainId: 1,
            explorer: 'https://api.etherscan.io/api',
            apiKey: process.env.ETHERSCAN_API_KEY,
            decimals: 18,
            type: 'evm'
        },
        polygon: {
            name: 'Polygon',
            symbol: 'MATIC',
            chainId: 137,
            explorer: 'https://api.polygonscan.com/api',
            apiKey: process.env.POLYGONSCAN_API_KEY,
            decimals: 18,
            type: 'evm'
        },
        bsc: {
            name: 'BNB Smart Chain',
            symbol: 'BNB',
            chainId: 56,
            explorer: 'https://api.bscscan.com/api',
            apiKey: process.env.BSCSCAN_API_KEY,
            decimals: 18,
            type: 'evm'
        },
        arbitrum: {
            name: 'Arbitrum One',
            symbol: 'ETH',
            chainId: 42161,
            explorer: 'https://api.arbiscan.io/api',
            apiKey: process.env.ARBISCAN_API_KEY,
            decimals: 18,
            type: 'evm'
        },
        optimism: {
            name: 'Optimism',
            symbol: 'ETH',
            chainId: 10,
            explorer: 'https://api-optimistic.etherscan.io/api',
            apiKey: process.env.OPTIMISM_API_KEY,
            decimals: 18,
            type: 'evm'
        },
        avalanche: {
            name: 'Avalanche C-Chain',
            symbol: 'AVAX',
            chainId: 43114,
            explorer: 'https://api.snowtrace.io/api',
            apiKey: process.env.SNOWTRACE_API_KEY,
            decimals: 18,
            type: 'evm'
        },
        solana: {
            name: 'Solana',
            symbol: 'SOL',
            explorer: 'https://public-api.solscan.io',
            apiKey: process.env.SOLSCAN_API_KEY,
            decimals: 9,
            type: 'solana'
        },
        bitcoin: {
            name: 'Bitcoin',
            symbol: 'BTC',
            explorer: 'https://blockchain.info',
            decimals: 8,
            type: 'bitcoin'
        }
    },

    // DEX Contract Addresses (for pattern detection)
    DEX_CONTRACTS: {
        ethereum: [
            '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2
            '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3
            '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', // Sushiswap
        ],
        polygon: [
            '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // QuickSwap
        ],
        bsc: [
            '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2
        ]
    },

    // AI Analysis Settings
    AI_SETTINGS: {
        enableAnalysis: process.env.ENABLE_AI_ANALYSIS !== 'false',
        analysisInterval: parseInt(process.env.AI_ANALYSIS_INTERVAL) || 300000, // 5 minutes
        degenThreshold: {
            txPerDay: 50, // More than 50 tx per day
            avgValue: 0.1, // Average tx value
            dexInteractionRatio: 0.3 // 30% of transactions are DEX interactions
        }
    }
};