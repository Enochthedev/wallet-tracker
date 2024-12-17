CREATE TABLE IF NOT EXISTS transactions (
    hash TEXT PRIMARY KEY,
    from_address TEXT,
    to_address TEXT,
    value REAL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_balance (
    id SERIAL PRIMARY KEY,
    balance REAL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);