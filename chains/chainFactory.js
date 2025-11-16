const EVMAdapter = require('./evmAdapter');
const SolanaAdapter = require('./solanaAdapter');
const BitcoinAdapter = require('./bitcoinAdapter');
const { CHAINS } = require('../config/config');

class ChainFactory {
    static adapters = {};

    /**
     * Get adapter for a specific chain
     */
    static getAdapter(chainKey) {
        // Return cached adapter if exists
        if (this.adapters[chainKey]) {
            return this.adapters[chainKey];
        }

        // Get chain config
        const chainConfig = CHAINS[chainKey];
        if (!chainConfig) {
            throw new Error(`Unsupported chain: ${chainKey}`);
        }

        // Create appropriate adapter based on chain type
        let adapter;
        switch (chainConfig.type) {
            case 'evm':
                adapter = new EVMAdapter(chainKey);
                break;
            case 'solana':
                adapter = new SolanaAdapter();
                break;
            case 'bitcoin':
                adapter = new BitcoinAdapter();
                break;
            default:
                throw new Error(`Unknown chain type: ${chainConfig.type}`);
        }

        // Cache and return adapter
        this.adapters[chainKey] = adapter;
        return adapter;
    }

    /**
     * Get all supported chains
     */
    static getSupportedChains() {
        return Object.keys(CHAINS);
    }

    /**
     * Get balance across all chains for an address
     */
    static async getMultiChainBalance(address) {
        const chains = this.getSupportedChains();
        const balances = [];

        for (const chain of chains) {
            try {
                const adapter = this.getAdapter(chain);
                const balance = await adapter.getBalance(address);
                balances.push(balance);
            } catch (error) {
                console.error(`Error fetching balance for ${chain}:`, error.message);
                balances.push({
                    balance: 0,
                    symbol: CHAINS[chain].symbol,
                    chain: chain,
                    error: error.message
                });
            }
        }

        return balances;
    }

    /**
     * Get transactions across all chains
     */
    static async getMultiChainTransactions(address, limit = 50) {
        const chains = this.getSupportedChains();
        const allTransactions = [];

        for (const chain of chains) {
            try {
                const adapter = this.getAdapter(chain);
                const transactions = await adapter.getTransactions(address, limit);
                allTransactions.push(...transactions);
            } catch (error) {
                console.error(`Error fetching transactions for ${chain}:`, error.message);
            }
        }

        // Sort by timestamp descending
        return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Validate address format for a specific chain
     */
    static isValidAddress(address, chainKey) {
        try {
            const adapter = this.getAdapter(chainKey);
            if (typeof adapter.isValidAddress === 'function') {
                return adapter.isValidAddress(address);
            }

            // Basic validation for EVM chains
            if (CHAINS[chainKey].type === 'evm') {
                return /^0x[a-fA-F0-9]{40}$/.test(address);
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = ChainFactory;
