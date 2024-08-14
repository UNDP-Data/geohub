import pkg from 'pg';
const { Pool } = pkg;
import { env } from '$env/dynamic/private';

/**
 * Create a new connection pool to the database.
 */
const pool = new Pool({
	connectionString: env.DATABASE_CONNECTION,
	max: 100
});

/**
 * Connect to the PostgreSQL database.
 * @returns {Promise<import("pg").Client>} A new client from the connection pool.
 */
export const connectToDB = async () => await pool.connect();
