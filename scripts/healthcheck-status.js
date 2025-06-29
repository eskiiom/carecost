const axios = require('axios');
const { Client } = require('pg');
require('dotenv').config();

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';
const POSTGRES_CONFIG = {
  connectionString: process.env.DATABASE_URL,
};

async function checkHTTP(name, url) {
  try {
    const res = await axios.get(url);
    console.log(`✅ ${name} OK (${res.status})`);
  } catch (err) {
    console.error(`❌ ${name} DOWN (${err.message})`);
  }
}

async function checkPostgres() {
  const client = new Client(POSTGRES_CONFIG);
  try {
    await client.connect();
    const res = await client.query('SELECT 1');
    if (res && res.rows) {
      console.log('✅ PostgreSQL OK');
    } else {
      console.error('❌ PostgreSQL DOWN (no response)');
    }
  } catch (err) {
    console.error(`❌ PostgreSQL DOWN (${err.message})`);
  } finally {
    await client.end();
  }
}

(async () => {
  console.log('--- Healthcheck CareCost ---');
  await checkHTTP('Backend', BACKEND_URL);
  await checkHTTP('Frontend', FRONTEND_URL);
  await checkPostgres();
})(); 