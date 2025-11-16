const axios = require('axios');
const { ethers } = require('ethers');
const { CHAINS, RPC_ENDPOINTS } = require('../config/config');

class EVMAdapter {
    constructor(chainKey) {
        this.chain = CHAINS[chainKey];
        this.chainKey = chainKey;
        this.provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[chainKey]);
    }

    /**
     * Fetch wallet balance
     */
    async getBalance(address) {
        try {
            // Try RPC first
            const balanceWei = await this.provider.getBalance(address);
            const balance = parseFloat(ethers.formatEther(balanceWei));

            return {
                balance,
                symbol: this.chain.symbol,
                chain: this.chainKey
            };
        } catch (error) {
            // Fallback to explorer API
            return this.getBalanceFromExplorer(address);
        }
    }

    /**
     * Fetch balance from block explorer API
     */
    async getBalanceFromExplorer(address) {
        try {
            const response = await axios.get(this.chain.explorer, {
                params: {
                    module: 'account',
                    action: 'balance',
                    address: address,
                    tag: 'latest',
                    apikey: this.chain.apiKey,
                },
            });

            if (response.data.status === '1') {
                const balance = parseFloat(response.data.result) / Math.pow(10, this.chain.decimals);
                return {
                    balance,
                    symbol: this.chain.symbol,
                    chain: this.chainKey
                };
            }
            throw new Error(response.data.message);
        } catch (error) {
            console.error(`Error fetching balance from ${this.chainKey}:`, error.message);
            return { balance: 0, symbol: this.chain.symbol, chain: this.chainKey };
        }
    }

    /**
     * Fetch transaction history
     */
    async getTransactions(address, startBlock = 0, endBlock = 99999999) {
        try {
            const response = await axios.get(this.chain.explorer, {
                params: {
                    module: 'account',
                    action: 'txlist',
                    address: address,
                    startblock: startBlock,
                    endblock: endBlock,
                    sort: 'desc',
                    apikey: this.chain.apiKey,
                },
            });

            if (response.data.status === '1') {
                return response.data.result.map(tx => this.formatTransaction(tx));
            }
            return [];
        } catch (error) {
            console.error(`Error fetching transactions from ${this.chainKey}:`, error.message);
            return [];
        }
    }

    /**
     * Fetch token transfers (ERC20)
     */
    async getTokenTransfers(address, contractAddress = null) {
        try {
            const params = {
                module: 'account',
                action: 'tokentx',
                address: address,
                sort: 'desc',
                apikey: this.chain.apiKey,
            };

            if (contractAddress) {
                params.contractaddress = contractAddress;
            }

            const response = await axios.get(this.chain.explorer, { params });

            if (response.data.status === '1') {
                return response.data.result.map(tx => this.formatTokenTransfer(tx));
            }
            return [];
        } catch (error) {
            console.error(`Error fetching token transfers from ${this.chainKey}:`, error.message);
            return [];
        }
    }

    /**
     * Get gas price
     */
    async getGasPrice() {
        try {
            const gasPrice = await this.provider.getFeeData();
            return {
                gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0n, 'gwei'),
                maxFeePerGas: ethers.formatUnits(gasPrice.maxFeePerGas || 0n, 'gwei'),
                maxPriorityFeePerGas: ethers.formatUnits(gasPrice.maxPriorityFeePerGas || 0n, 'gwei'),
                chain: this.chainKey
            };
        } catch (error) {
            console.error(`Error fetching gas price from ${this.chainKey}:`, error.message);
            return null;
        }
    }

    /**
     * Format transaction data
     */
    formatTransaction(tx) {
        return {
            hash: tx.hash,
            chain: this.chainKey,
            from: tx.from,
            to: tx.to,
            value: parseFloat(tx.value) / Math.pow(10, this.chain.decimals),
            gasUsed: parseFloat(tx.gasUsed || 0),
            gasPrice: parseFloat(tx.gasPrice || 0) / 1e9, // Convert to Gwei
            blockNumber: parseInt(tx.blockNumber),
            timestamp: new Date(parseInt(tx.timeStamp) * 1000),
            contractAddress: tx.contractAddress || null,
            methodId: tx.methodId || null,
            isError: tx.isError === '1',
            transactionType: this.determineTransactionType(tx)
        };
    }

    /**
     * Format token transfer data
     */
    formatTokenTransfer(tx) {
        return {
            hash: tx.hash,
            chain: this.chainKey,
            from: tx.from,
            to: tx.to,
            tokenAddress: tx.contractAddress,
            tokenName: tx.tokenName,
            tokenSymbol: tx.tokenSymbol,
            amount: parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal)),
            timestamp: new Date(parseInt(tx.timeStamp) * 1000),
            transferType: 'ERC20'
        };
    }

    /**
     * Determine transaction type
     */
    determineTransactionType(tx) {
        if (tx.contractAddress) return 'contract_creation';
        if (tx.to === null || tx.to === '') return 'contract_creation';
        if (tx.input && tx.input !== '0x') return 'contract_interaction';
        return 'transfer';
    }

    /**
     * Check if address is a contract
     */
    async isContract(address) {
        try {
            const code = await this.provider.getCode(address);
            return code !== '0x';
        } catch (error) {
            return false;
        }
    }
}

module.exports = EVMAdapter;
