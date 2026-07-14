import { Pool } from 'pg';

// Connection pool for local PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'grocery',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(sql: string, values?: any[]) {
  try {
    const result = await pool.query(sql, values);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function queryOne(sql: string, values?: any[]) {
  const result = await query(sql, values);
  return result.rows[0];
}

export async function queryAll(sql: string, values?: any[]) {
  const result = await query(sql, values);
  return result.rows;
}

// Close the pool (call this on app shutdown)
export async function closePool() {
  await pool.end();
}

export default pool;
