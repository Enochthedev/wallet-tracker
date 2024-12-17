const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Function to initialize the database connection
async function connectDB() {
    try {
        await pool.connect();
        console.log(`✅ Connected to PostgreSQL (${process.env.NODE_ENV || 'development'})`);
    } catch (err) {
        console.error('❌ PostgreSQL Connection Error:', err.message);
        process.exit(1);
    }
}

module.exports = { connectDB, pool };