-- Wallets being tracked
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    chain TEXT NOT NULL,
    label TEXT,
    is_degen BOOLEAN DEFAULT false,
    risk_score REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(address, chain)
);

-- Multi-chain transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    hash TEXT NOT NULL,
    chain TEXT NOT NULL,
    from_address TEXT,
    to_address TEXT,
    value REAL,
    token_symbol TEXT DEFAULT 'native',
    token_address TEXT,
    gas_used REAL,
    gas_price REAL,
    block_number BIGINT,
    transaction_type TEXT,
    contract_address TEXT,
    method_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hash, chain)
);

-- Wallet balance snapshots across chains
CREATE TABLE IF NOT EXISTS wallet_balance (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    chain TEXT NOT NULL,
    balance REAL,
    token_symbol TEXT DEFAULT 'native',
    usd_value REAL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI-powered transaction analysis
CREATE TABLE IF NOT EXISTS transaction_analysis (
    id SERIAL PRIMARY KEY,
    transaction_hash TEXT NOT NULL,
    chain TEXT NOT NULL,
    analysis_type TEXT,
    pattern_detected TEXT,
    risk_level TEXT,
    confidence_score REAL,
    insights JSONB,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_hash, chain) REFERENCES transactions(hash, chain)
);

-- Wallet behavior patterns
CREATE TABLE IF NOT EXISTS wallet_patterns (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    chain TEXT NOT NULL,
    pattern_type TEXT,
    frequency INTEGER,
    avg_transaction_value REAL,
    total_volume REAL,
    dex_interactions INTEGER DEFAULT 0,
    nft_trades INTEGER DEFAULT 0,
    high_risk_interactions INTEGER DEFAULT 0,
    last_active TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallet_address, chain, pattern_type)
);

-- Token transfers tracking
CREATE TABLE IF NOT EXISTS token_transfers (
    id SERIAL PRIMARY KEY,
    transaction_hash TEXT NOT NULL,
    chain TEXT NOT NULL,
    from_address TEXT,
    to_address TEXT,
    token_address TEXT,
    token_name TEXT,
    token_symbol TEXT,
    amount REAL,
    usd_value REAL,
    transfer_type TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEX interactions tracking
CREATE TABLE IF NOT EXISTS dex_interactions (
    id SERIAL PRIMARY KEY,
    transaction_hash TEXT NOT NULL,
    chain TEXT NOT NULL,
    wallet_address TEXT,
    dex_name TEXT,
    action_type TEXT,
    token_in TEXT,
    token_out TEXT,
    amount_in REAL,
    amount_out REAL,
    price_impact REAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_chain ON transactions(chain);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_wallets_chain ON wallets(chain);
CREATE INDEX IF NOT EXISTS idx_wallet_balance_chain ON wallet_balance(chain);
CREATE INDEX IF NOT EXISTS idx_transaction_analysis_chain ON transaction_analysis(chain);
CREATE INDEX IF NOT EXISTS idx_wallet_patterns_chain ON wallet_patterns(chain);