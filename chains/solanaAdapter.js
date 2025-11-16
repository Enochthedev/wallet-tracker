const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const axios = require('axios');
const { RPC_ENDPOINTS, CHAINS } = require('../config/config');

class SolanaAdapter {
    constructor() {
        this.connection = new Connection(RPC_ENDPOINTS.solana, 'confirmed');
        this.chain = CHAINS.solana;
        this.chainKey = 'solana';
    }

    /**
     * Fetch wallet balance
     */
    async getBalance(address) {
        try {
            const publicKey = new PublicKey(address);
            const balance = await this.connection.getBalance(publicKey);

            return {
                balance: balance / LAMPORTS_PER_SOL,
                symbol: this.chain.symbol,
                chain: this.chainKey
            };
        } catch (error) {
            console.error('Error fetching Solana balance:', error.message);
            return { balance: 0, symbol: this.chain.symbol, chain: this.chainKey };
        }
    }

    /**
     * Fetch transaction history
     */
    async getTransactions(address, limit = 100) {
        try {
            const publicKey = new PublicKey(address);
            const signatures = await this.connection.getSignaturesForAddress(
                publicKey,
                { limit }
            );

            const transactions = [];

            for (const sig of signatures) {
                const tx = await this.connection.getParsedTransaction(
                    sig.signature,
                    { maxSupportedTransactionVersion: 0 }
                );

                if (tx) {
                    transactions.push(this.formatTransaction(tx, sig.signature, address));
                }
            }

            return transactions;
        } catch (error) {
            console.error('Error fetching Solana transactions:', error.message);
            return [];
        }
    }

    /**
     * Fetch token balances
     */
    async getTokenBalances(address) {
        try {
            const publicKey = new PublicKey(address);
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                publicKey,
                { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
            );

            return tokenAccounts.value.map(account => ({
                mint: account.account.data.parsed.info.mint,
                amount: account.account.data.parsed.info.tokenAmount.uiAmount,
                decimals: account.account.data.parsed.info.tokenAmount.decimals,
                chain: this.chainKey
            }));
        } catch (error) {
            console.error('Error fetching Solana token balances:', error.message);
            return [];
        }
    }

    /**
     * Format transaction data
     */
    formatTransaction(tx, signature, walletAddress) {
        const meta = tx.meta;
        const message = tx.transaction.message;

        // Get pre and post balances
        const accountKeys = message.accountKeys.map(key => key.pubkey.toString());
        const walletIndex = accountKeys.indexOf(walletAddress);

        let value = 0;
        if (walletIndex >= 0 && meta.preBalances[walletIndex] !== undefined) {
            value = Math.abs(
                (meta.postBalances[walletIndex] - meta.preBalances[walletIndex]) / LAMPORTS_PER_SOL
            );
        }

        return {
            hash: signature,
            chain: this.chainKey,
            from: accountKeys[0] || null,
            to: accountKeys[1] || null,
            value: value,
            gasUsed: meta.fee / LAMPORTS_PER_SOL,
            gasPrice: 0,
            blockNumber: tx.slot,
            timestamp: tx.blockTime ? new Date(tx.blockTime * 1000) : new Date(),
            contractAddress: null,
            methodId: null,
            isError: meta.err !== null,
            transactionType: this.determineTransactionType(message),
            programIds: message.instructions.map(ix =>
                message.accountKeys[ix.programIdIndex].pubkey.toString()
            )
        };
    }

    /**
     * Determine transaction type
     */
    determineTransactionType(message) {
        const programIds = message.instructions.map(ix =>
            message.accountKeys[ix.programIdIndex].pubkey.toString()
        );

        // Check for common program IDs
        if (programIds.includes('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')) {
            return 'token_transfer';
        }
        if (programIds.some(id => id.includes('Swap') || id.includes('DEX'))) {
            return 'dex_interaction';
        }
        if (programIds.includes('11111111111111111111111111111111')) {
            return 'sol_transfer';
        }

        return 'program_interaction';
    }

    /**
     * Fetch transaction with Solscan API (if API key available)
     */
    async getTransactionsFromSolscan(address, limit = 50) {
        try {
            if (!this.chain.apiKey) {
                console.warn('Solscan API key not configured');
                return [];
            }

            const response = await axios.get(`${this.chain.explorer}/account/transactions`, {
                params: {
                    account: address,
                    limit: limit
                },
                headers: {
                    'token': this.chain.apiKey
                }
            });

            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching from Solscan:', error.message);
            return [];
        }
    }

    /**
     * Check if address is valid
     */
    isValidAddress(address) {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = SolanaAdapter;
