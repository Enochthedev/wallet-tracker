const axios = require('axios');
const { CHAINS } = require('../config/config');

class BitcoinAdapter {
    constructor() {
        this.chain = CHAINS.bitcoin;
        this.chainKey = 'bitcoin';
        this.baseUrl = 'https://blockchain.info';
    }

    /**
     * Fetch wallet balance
     */
    async getBalance(address) {
        try {
            const response = await axios.get(`${this.baseUrl}/q/addressbalance/${address}`);
            const balanceSatoshi = parseInt(response.data);
            const balance = balanceSatoshi / 1e8; // Convert satoshi to BTC

            return {
                balance,
                symbol: this.chain.symbol,
                chain: this.chainKey
            };
        } catch (error) {
            console.error('Error fetching Bitcoin balance:', error.message);
            return { balance: 0, symbol: this.chain.symbol, chain: this.chainKey };
        }
    }

    /**
     * Fetch transaction history
     */
    async getTransactions(address, limit = 50) {
        try {
            const response = await axios.get(`${this.baseUrl}/rawaddr/${address}`, {
                params: { limit }
            });

            const data = response.data;

            return data.txs.map(tx => this.formatTransaction(tx, address));
        } catch (error) {
            console.error('Error fetching Bitcoin transactions:', error.message);
            return [];
        }
    }

    /**
     * Get address info (balance, tx count, etc.)
     */
    async getAddressInfo(address) {
        try {
            const response = await axios.get(`${this.baseUrl}/rawaddr/${address}`, {
                params: { limit: 0 }
            });

            const data = response.data;

            return {
                address: data.address,
                balance: data.final_balance / 1e8,
                totalReceived: data.total_received / 1e8,
                totalSent: data.total_sent / 1e8,
                txCount: data.n_tx,
                chain: this.chainKey
            };
        } catch (error) {
            console.error('Error fetching Bitcoin address info:', error.message);
            return null;
        }
    }

    /**
     * Get single transaction details
     */
    async getTransaction(txHash) {
        try {
            const response = await axios.get(`${this.baseUrl}/rawtx/${txHash}`);
            return this.formatTransaction(response.data);
        } catch (error) {
            console.error('Error fetching Bitcoin transaction:', error.message);
            return null;
        }
    }

    /**
     * Format transaction data
     */
    formatTransaction(tx, walletAddress = null) {
        // Calculate input and output values
        let inputValue = 0;
        let outputValue = 0;
        let from = [];
        let to = [];

        // Process inputs
        if (tx.inputs) {
            tx.inputs.forEach(input => {
                if (input.prev_out) {
                    inputValue += input.prev_out.value;
                    if (input.prev_out.addr) {
                        from.push(input.prev_out.addr);
                    }
                }
            });
        }

        // Process outputs
        if (tx.out) {
            tx.out.forEach(output => {
                outputValue += output.value;
                if (output.addr) {
                    to.push(output.addr);
                }
            });
        }

        // Determine value from wallet perspective
        let value = 0;
        if (walletAddress) {
            const isReceiver = to.includes(walletAddress);
            const isSender = from.includes(walletAddress);

            if (isReceiver && !isSender) {
                // Pure receive
                value = tx.out
                    .filter(out => out.addr === walletAddress)
                    .reduce((sum, out) => sum + out.value, 0) / 1e8;
            } else if (isSender && !isReceiver) {
                // Pure send
                value = inputValue / 1e8;
            } else {
                // Internal transfer or complex
                value = Math.abs(outputValue - inputValue) / 1e8;
            }
        } else {
            value = outputValue / 1e8;
        }

        return {
            hash: tx.hash,
            chain: this.chainKey,
            from: from[0] || null,
            to: to[0] || null,
            value: value,
            gasUsed: tx.fee / 1e8 || 0,
            gasPrice: 0,
            blockNumber: tx.block_height || null,
            timestamp: tx.time ? new Date(tx.time * 1000) : new Date(),
            contractAddress: null,
            methodId: null,
            isError: false,
            transactionType: 'transfer',
            size: tx.size,
            weight: tx.weight,
            inputs: tx.inputs?.length || 0,
            outputs: tx.out?.length || 0
        };
    }

    /**
     * Get current Bitcoin price in USD
     */
    async getBTCPrice() {
        try {
            const response = await axios.get('https://blockchain.info/ticker');
            return response.data.USD.last;
        } catch (error) {
            console.error('Error fetching BTC price:', error.message);
            return null;
        }
    }

    /**
     * Get unspent outputs (UTXOs)
     */
    async getUnspentOutputs(address) {
        try {
            const response = await axios.get(`${this.baseUrl}/unspent`, {
                params: { active: address }
            });

            return response.data.unspent_outputs.map(utxo => ({
                txHash: utxo.tx_hash_big_endian,
                outputIndex: utxo.tx_output_n,
                value: utxo.value / 1e8,
                confirmations: utxo.confirmations,
                script: utxo.script
            }));
        } catch (error) {
            console.error('Error fetching UTXOs:', error.message);
            return [];
        }
    }

    /**
     * Validate Bitcoin address
     */
    isValidAddress(address) {
        // Basic Bitcoin address validation (simplified)
        const patterns = [
            /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // P2PKH and P2SH (Legacy)
            /^bc1[a-z0-9]{39,59}$/,              // Bech32 (SegWit)
        ];

        return patterns.some(pattern => pattern.test(address));
    }
}

module.exports = BitcoinAdapter;
