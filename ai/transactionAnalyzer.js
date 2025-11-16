const Anthropic = require('@anthropic-ai/sdk');
const { ANTHROPIC_API_KEY, AI_SETTINGS, DEX_CONTRACTS } = require('../config/config');

class TransactionAnalyzer {
    constructor() {
        this.client = ANTHROPIC_API_KEY ? new Anthropic({
            apiKey: ANTHROPIC_API_KEY,
        }) : null;
        this.enabled = AI_SETTINGS.enableAnalysis && this.client !== null;
    }

    /**
     * Analyze a batch of transactions for patterns
     */
    async analyzeTransactions(transactions) {
        if (!this.enabled) {
            console.log('AI analysis disabled or API key not configured');
            return null;
        }

        try {
            const prompt = this.buildAnalysisPrompt(transactions);

            const message = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const analysisText = message.content[0].text;
            return this.parseAnalysisResponse(analysisText, transactions);
        } catch (error) {
            console.error('Error in AI transaction analysis:', error.message);
            return null;
        }
    }

    /**
     * Build analysis prompt
     */
    buildAnalysisPrompt(transactions) {
        const txSummary = transactions.map((tx, idx) => {
            return `${idx + 1}. ${tx.chain.toUpperCase()} - ${tx.transactionType} - ${tx.value} ${tx.token_symbol || 'native'} - From: ${tx.from_address?.slice(0, 10)}... To: ${tx.to_address?.slice(0, 10)}... - Block: ${tx.block_number}`;
        }).join('\n');

        return `You are a blockchain transaction analyst. Analyze the following transactions and provide insights:

TRANSACTIONS:
${txSummary}

Analyze these transactions and provide:
1. Overall pattern classification (e.g., "high-frequency trading", "hodler", "degen trader", "normal user", "bot activity", "arbitrage")
2. Risk assessment (low/medium/high) with reasoning
3. Notable behaviors or red flags
4. DEX interaction frequency
5. Estimated sophistication level (beginner/intermediate/advanced/expert)
6. Key insights about wallet behavior

Format your response as JSON:
{
  "pattern": "pattern type",
  "riskLevel": "low/medium/high",
  "confidenceScore": 0.0-1.0,
  "isDegen": true/false,
  "sophisticationLevel": "beginner/intermediate/advanced/expert",
  "dexInteractionCount": number,
  "insights": {
    "tradingStyle": "description",
    "riskFactors": ["factor1", "factor2"],
    "strengths": ["strength1", "strength2"],
    "recommendations": ["rec1", "rec2"]
  }
}`;
    }

    /**
     * Parse AI response
     */
    parseAnalysisResponse(responseText, transactions) {
        try {
            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const analysis = JSON.parse(jsonMatch[0]);

            return {
                pattern_detected: analysis.pattern,
                risk_level: analysis.riskLevel,
                confidence_score: analysis.confidenceScore,
                is_degen: analysis.isDegen,
                sophistication_level: analysis.sophisticationLevel,
                insights: analysis.insights,
                transaction_count: transactions.length,
                analyzed_at: new Date()
            };
        } catch (error) {
            console.error('Error parsing AI response:', error.message);
            // Return basic analysis
            return this.fallbackAnalysis(transactions);
        }
    }

    /**
     * Fallback rule-based analysis when AI is unavailable
     */
    fallbackAnalysis(transactions) {
        const txCount = transactions.length;
        const dexInteractions = this.countDEXInteractions(transactions);
        const avgValue = this.calculateAverageValue(transactions);
        const uniqueContracts = new Set(
            transactions
                .filter(tx => tx.contract_address)
                .map(tx => tx.contract_address)
        ).size;

        // Degen detection logic
        const isDegen = (
            txCount > AI_SETTINGS.degenThreshold.txPerDay ||
            (dexInteractions / txCount) > AI_SETTINGS.degenThreshold.dexInteractionRatio ||
            uniqueContracts > 10
        );

        // Risk assessment
        let riskLevel = 'low';
        let riskScore = 0;

        if (txCount > 100) riskScore += 0.3;
        if (dexInteractions > 20) riskScore += 0.3;
        if (avgValue > 10) riskScore += 0.2;
        if (uniqueContracts > 20) riskScore += 0.2;

        if (riskScore > 0.6) riskLevel = 'high';
        else if (riskScore > 0.3) riskLevel = 'medium';

        return {
            pattern_detected: isDegen ? 'degen_trader' : 'normal_user',
            risk_level: riskLevel,
            confidence_score: 0.7,
            is_degen: isDegen,
            sophistication_level: this.estimateSophistication(transactions),
            insights: {
                tradingStyle: isDegen ? 'High activity trader' : 'Moderate activity',
                riskFactors: this.identifyRiskFactors(transactions),
                metrics: {
                    totalTransactions: txCount,
                    dexInteractions: dexInteractions,
                    avgTransactionValue: avgValue,
                    uniqueContracts: uniqueContracts
                }
            },
            transaction_count: txCount,
            analyzed_at: new Date()
        };
    }

    /**
     * Count DEX interactions
     */
    countDEXInteractions(transactions) {
        let count = 0;
        for (const tx of transactions) {
            const chain = tx.chain;
            const to = tx.to_address?.toLowerCase();

            if (DEX_CONTRACTS[chain]) {
                const dexAddresses = DEX_CONTRACTS[chain].map(addr => addr.toLowerCase());
                if (dexAddresses.includes(to)) {
                    count++;
                }
            }

            // Also check transaction type
            if (tx.transaction_type?.includes('dex') || tx.transaction_type?.includes('swap')) {
                count++;
            }
        }
        return count;
    }

    /**
     * Calculate average transaction value
     */
    calculateAverageValue(transactions) {
        if (transactions.length === 0) return 0;
        const total = transactions.reduce((sum, tx) => sum + (tx.value || 0), 0);
        return total / transactions.length;
    }

    /**
     * Estimate wallet sophistication
     */
    estimateSophistication(transactions) {
        const uniqueContracts = new Set(
            transactions
                .filter(tx => tx.contract_address)
                .map(tx => tx.contract_address)
        ).size;

        const dexCount = this.countDEXInteractions(transactions);
        const avgValue = this.calculateAverageValue(transactions);

        if (uniqueContracts > 30 && dexCount > 50 && avgValue > 5) return 'expert';
        if (uniqueContracts > 15 && dexCount > 20) return 'advanced';
        if (uniqueContracts > 5 && dexCount > 5) return 'intermediate';
        return 'beginner';
    }

    /**
     * Identify risk factors
     */
    identifyRiskFactors(transactions) {
        const factors = [];

        const dexCount = this.countDEXInteractions(transactions);
        if (dexCount > 30) factors.push('High DEX activity');

        const avgValue = this.calculateAverageValue(transactions);
        if (avgValue > 10) factors.push('High average transaction value');

        const failedTx = transactions.filter(tx => tx.isError).length;
        if (failedTx > transactions.length * 0.1) {
            factors.push('High failure rate');
        }

        const chains = new Set(transactions.map(tx => tx.chain));
        if (chains.size > 4) factors.push('Multi-chain activity');

        return factors.length > 0 ? factors : ['No significant risk factors detected'];
    }

    /**
     * Analyze wallet behavior over time
     */
    async analyzeWalletBehavior(wallet, transactions) {
        const patterns = {
            wallet_address: wallet.address,
            chain: wallet.chain,
            total_transactions: transactions.length,
            date_range: {
                first: transactions[transactions.length - 1]?.timestamp,
                last: transactions[0]?.timestamp
            }
        };

        // Transaction frequency analysis
        const timeSpan = new Date(patterns.date_range.last) - new Date(patterns.date_range.first);
        const daysActive = timeSpan / (1000 * 60 * 60 * 24);
        patterns.avg_tx_per_day = daysActive > 0 ? transactions.length / daysActive : 0;

        // Value analysis
        patterns.total_volume = transactions.reduce((sum, tx) => sum + (tx.value || 0), 0);
        patterns.avg_transaction_value = patterns.total_volume / transactions.length;

        // Activity patterns
        patterns.dex_interactions = this.countDEXInteractions(transactions);
        patterns.contract_interactions = transactions.filter(
            tx => tx.transaction_type === 'contract_interaction'
        ).length;

        // Get AI insights if available
        if (this.enabled && transactions.length > 0) {
            const aiAnalysis = await this.analyzeTransactions(transactions.slice(0, 50));
            if (aiAnalysis) {
                patterns.ai_analysis = aiAnalysis;
            }
        }

        return patterns;
    }
}

module.exports = TransactionAnalyzer;
