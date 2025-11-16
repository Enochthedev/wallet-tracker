const { AI_SETTINGS } = require('../config/config');

class WalletPatternDetector {
    /**
     * Detect if wallet exhibits "degen" behavior
     */
    static detectDegenBehavior(walletData, transactions) {
        const metrics = this.calculateMetrics(transactions);
        const score = this.calculateDegenScore(metrics);

        return {
            isDegen: score > 0.6,
            degenScore: score,
            metrics: metrics,
            classification: this.classifyWallet(score, metrics),
            warnings: this.generateWarnings(metrics)
        };
    }

    /**
     * Calculate wallet metrics
     */
    static calculateMetrics(transactions) {
        if (!transactions || transactions.length === 0) {
            return null;
        }

        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        // Time-based metrics
        const txLast24h = transactions.filter(tx => new Date(tx.timestamp) > oneDayAgo).length;
        const txLastWeek = transactions.filter(tx => new Date(tx.timestamp) > oneWeekAgo).length;

        // Value metrics
        const totalVolume = transactions.reduce((sum, tx) => sum + (tx.value || 0), 0);
        const avgTxValue = totalVolume / transactions.length;
        const maxTxValue = Math.max(...transactions.map(tx => tx.value || 0));

        // Interaction metrics
        const contractInteractions = transactions.filter(
            tx => tx.transaction_type === 'contract_interaction' ||
                  tx.contract_address !== null
        ).length;

        const uniqueContracts = new Set(
            transactions
                .filter(tx => tx.contract_address)
                .map(tx => tx.contract_address)
        ).size;

        const uniqueCounterparties = new Set([
            ...transactions.map(tx => tx.from_address),
            ...transactions.map(tx => tx.to_address)
        ].filter(Boolean)).size;

        // Chain diversity
        const chains = new Set(transactions.map(tx => tx.chain));

        // Failed transactions
        const failedTx = transactions.filter(tx => tx.isError === true).length;
        const failureRate = failedTx / transactions.length;

        // Gas analysis (EVM chains)
        const avgGasPrice = transactions
            .filter(tx => tx.gas_price)
            .reduce((sum, tx) => sum + tx.gas_price, 0) /
            transactions.filter(tx => tx.gas_price).length || 0;

        // Time pattern analysis
        const txByHour = this.groupByHour(transactions);
        const peakActivity = Math.max(...Object.values(txByHour));
        const activeHours = Object.keys(txByHour).length;

        return {
            totalTransactions: transactions.length,
            txLast24h,
            txLastWeek,
            totalVolume,
            avgTxValue,
            maxTxValue,
            contractInteractions,
            contractInteractionRate: contractInteractions / transactions.length,
            uniqueContracts,
            uniqueCounterparties,
            chainDiversity: chains.size,
            chains: Array.from(chains),
            failureRate,
            avgGasPrice,
            peakActivity,
            activeHours,
            activityScore: txLast24h / 100 // Normalized activity score
        };
    }

    /**
     * Calculate degen score (0-1)
     */
    static calculateDegenScore(metrics) {
        if (!metrics) return 0;

        let score = 0;

        // High transaction frequency (max 0.3)
        if (metrics.txLast24h > 100) score += 0.3;
        else if (metrics.txLast24h > 50) score += 0.2;
        else if (metrics.txLast24h > 20) score += 0.1;

        // High contract interaction rate (max 0.25)
        if (metrics.contractInteractionRate > 0.8) score += 0.25;
        else if (metrics.contractInteractionRate > 0.5) score += 0.15;
        else if (metrics.contractInteractionRate > 0.3) score += 0.1;

        // Multiple unique contracts (max 0.2)
        if (metrics.uniqueContracts > 30) score += 0.2;
        else if (metrics.uniqueContracts > 15) score += 0.15;
        else if (metrics.uniqueContracts > 5) score += 0.1;

        // High failure rate indicates experimentation (max 0.15)
        if (metrics.failureRate > 0.15) score += 0.15;
        else if (metrics.failureRate > 0.1) score += 0.1;
        else if (metrics.failureRate > 0.05) score += 0.05;

        // Multi-chain activity (max 0.1)
        if (metrics.chainDiversity > 4) score += 0.1;
        else if (metrics.chainDiversity > 2) score += 0.05;

        return Math.min(score, 1.0);
    }

    /**
     * Classify wallet based on behavior
     */
    static classifyWallet(score, metrics) {
        if (score > 0.7) {
            return {
                type: 'extreme_degen',
                description: 'Extremely active trader with high-risk behavior',
                characteristics: [
                    'Very high transaction frequency',
                    'Extensive smart contract interactions',
                    'Multi-chain activity',
                    'Experimental trading patterns'
                ]
            };
        } else if (score > 0.5) {
            return {
                type: 'active_degen',
                description: 'Active DeFi user with elevated risk tolerance',
                characteristics: [
                    'High transaction frequency',
                    'Regular DEX usage',
                    'Multiple protocol interactions',
                    'Active yield farming or trading'
                ]
            };
        } else if (score > 0.3) {
            return {
                type: 'moderate_trader',
                description: 'Moderately active trader or DeFi user',
                characteristics: [
                    'Regular trading activity',
                    'Some DeFi protocol usage',
                    'Balanced risk profile'
                ]
            };
        } else {
            return {
                type: 'conservative_user',
                description: 'Conservative user with low activity',
                characteristics: [
                    'Low transaction frequency',
                    'Primarily simple transfers',
                    'Risk-averse behavior',
                    'Long-term holding pattern'
                ]
            };
        }
    }

    /**
     * Generate warnings based on patterns
     */
    static generateWarnings(metrics) {
        if (!metrics) return [];

        const warnings = [];

        if (metrics.failureRate > 0.2) {
            warnings.push({
                severity: 'high',
                message: 'Very high transaction failure rate detected',
                detail: `${(metrics.failureRate * 100).toFixed(1)}% of transactions failed`
            });
        }

        if (metrics.txLast24h > 200) {
            warnings.push({
                severity: 'medium',
                message: 'Extremely high transaction frequency',
                detail: `${metrics.txLast24h} transactions in last 24 hours - possible bot activity`
            });
        }

        if (metrics.maxTxValue > 100) {
            warnings.push({
                severity: 'high',
                message: 'Very high value transaction detected',
                detail: `Maximum transaction value: ${metrics.maxTxValue.toFixed(2)}`
            });
        }

        if (metrics.chainDiversity > 5) {
            warnings.push({
                severity: 'low',
                message: 'Multi-chain power user',
                detail: `Active on ${metrics.chainDiversity} different chains`
            });
        }

        if (metrics.uniqueContracts > 50) {
            warnings.push({
                severity: 'medium',
                message: 'Extensive smart contract interactions',
                detail: `Interacted with ${metrics.uniqueContracts} unique contracts`
            });
        }

        return warnings;
    }

    /**
     * Detect specific trading patterns
     */
    static detectTradingPatterns(transactions) {
        const patterns = [];

        // MEV bot detection
        if (this.detectMEVBot(transactions)) {
            patterns.push({
                type: 'mev_bot',
                confidence: 0.8,
                description: 'Possible MEV bot activity detected'
            });
        }

        // Arbitrage detection
        if (this.detectArbitrage(transactions)) {
            patterns.push({
                type: 'arbitrage',
                confidence: 0.7,
                description: 'Arbitrage trading pattern detected'
            });
        }

        // Sniping detection
        if (this.detectSniping(transactions)) {
            patterns.push({
                type: 'token_sniping',
                confidence: 0.75,
                description: 'Token sniping behavior detected'
            });
        }

        // High-frequency trading
        if (this.detectHighFrequencyTrading(transactions)) {
            patterns.push({
                type: 'high_frequency_trading',
                confidence: 0.85,
                description: 'High-frequency trading pattern'
            });
        }

        return patterns;
    }

    /**
     * Detect MEV bot behavior
     */
    static detectMEVBot(transactions) {
        const recentTx = transactions.slice(0, 50);

        // Check for rapid-fire transactions in same blocks
        const blockGroups = {};
        for (const tx of recentTx) {
            if (!blockGroups[tx.block_number]) {
                blockGroups[tx.block_number] = [];
            }
            blockGroups[tx.block_number].push(tx);
        }

        // MEV bots often have multiple tx in same block
        const multiTxBlocks = Object.values(blockGroups).filter(txs => txs.length > 2).length;
        return multiTxBlocks > 5;
    }

    /**
     * Detect arbitrage trading
     */
    static detectArbitrage(transactions) {
        // Look for quick buy-sell patterns
        for (let i = 0; i < transactions.length - 1; i++) {
            const tx1 = transactions[i];
            const tx2 = transactions[i + 1];

            const timeDiff = Math.abs(new Date(tx1.timestamp) - new Date(tx2.timestamp));

            // If transactions are within 1 minute and involve similar values
            if (timeDiff < 60000 && Math.abs(tx1.value - tx2.value) < 0.1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Detect token sniping
     */
    static detectSniping(transactions) {
        // Look for very fast transactions after contract deployment
        const contractCreations = transactions.filter(
            tx => tx.transaction_type === 'contract_creation'
        );

        if (contractCreations.length > 0) {
            for (const creation of contractCreations) {
                const nextTx = transactions.find(
                    tx => tx.block_number === creation.block_number + 1
                );
                if (nextTx) return true;
            }
        }
        return false;
    }

    /**
     * Detect high-frequency trading
     */
    static detectHighFrequencyTrading(transactions) {
        const recentTx = transactions.slice(0, 100);
        const timeSpan = new Date(recentTx[0].timestamp) -
                        new Date(recentTx[recentTx.length - 1].timestamp);

        // If 100 transactions in less than 1 hour
        return timeSpan < 3600000;
    }

    /**
     * Group transactions by hour
     */
    static groupByHour(transactions) {
        const byHour = {};
        for (const tx of transactions) {
            const hour = new Date(tx.timestamp).getHours();
            byHour[hour] = (byHour[hour] || 0) + 1;
        }
        return byHour;
    }

    /**
     * Calculate risk score for a wallet
     */
    static calculateRiskScore(metrics, aiAnalysis = null) {
        if (!metrics) return 0;

        let riskScore = 0;

        // Base risk from activity
        riskScore += Math.min(metrics.degenScore * 0.4, 0.4);

        // Failure rate risk
        riskScore += metrics.failureRate * 0.2;

        // Volume risk (high volume = higher risk)
        if (metrics.totalVolume > 100) riskScore += 0.2;
        else if (metrics.totalVolume > 50) riskScore += 0.15;
        else if (metrics.totalVolume > 10) riskScore += 0.1;

        // Multi-chain risk
        riskScore += (metrics.chainDiversity / 10) * 0.1;

        // AI analysis bonus
        if (aiAnalysis && aiAnalysis.risk_level === 'high') {
            riskScore += 0.1;
        }

        return Math.min(riskScore, 1.0);
    }
}

module.exports = WalletPatternDetector;
