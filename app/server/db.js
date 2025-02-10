const { Pool } = require('pg');
const config = require('./config');
const { webssh2debug } = require('./logging');

const pool = new Pool({
  host: config.database.postgres.host,
  port: config.database.postgres.port,
  database: config.database.postgres.database,
  user: config.database.postgres.user,
  password: config.database.postgres.password,
  ssl: config.database.postgres.ssl
});

async function getConnectionByUuid(uuid) {
  try {
    const query = 'SELECT host, port, username, password FROM ssh_connections WHERE uuid = $1';
    webssh2debug('DB Query:', query);
    webssh2debug('DB Params:', [uuid]);
    
    const result = await pool.query(query, [uuid]);
    webssh2debug('DB Result:', result.rows[0]);
    
    return result.rows[0];
  } catch (err) {
    webssh2debug('DB Error:', err);
    throw new Error('Database error when fetching connection details');
  }
}

module.exports = { getConnectionByUuid };
