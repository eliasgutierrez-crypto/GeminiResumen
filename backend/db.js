const { Pool } = require('pg');

// Crear pool usando DATABASE_URL del .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario en Render/Postgres remota
  }
});

module.exports = pool;