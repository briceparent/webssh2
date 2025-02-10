const { Pool } = require('pg');
const config = require('./config');
const { webssh2debug } = require('./logging');

let pool;

function initializePool() {
  if (pool) return pool;

  const dbConfig = config.database.postgres;
  
  pool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
    ssl: dbConfig.ssl,
    max: dbConfig.pool?.max,
    idleTimeoutMillis: dbConfig.pool?.idleTimeoutMillis,
    connectionTimeoutMillis: dbConfig.pool?.connectionTimeoutMillis
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
}

async function getConnectionByUuid(uuid) {
  const pool = initializePool();
  try {
    const result = await pool.query(
      'SELECT host, port, username, password FROM ssh_connections WHERE uuid = $1',
      [uuid]
    );
    return result.rows[0];
  } catch (err) {
    webssh2debug('DB Error:', err);
    throw new Error('Database error when fetching connection details');
  }
}

// Optional: function to test the database connection on startup
async function testConnection() {
  const pool = initializePool();
  try {
    await pool.query('SELECT NOW()');
    console.info('Successfully connected to PostgreSQL database');
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err);
    throw err;
  }
}

module.exports = { 
  getConnectionByUuid,
  testConnection
};
