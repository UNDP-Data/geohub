import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Client, Pool } = pkg;
import { env } from '$env/dynamic/private';
import * as schema from '$lib/server/schema.js';

/**
 * get drizzle instance with db client.
 * Use this for transaction query such as insert, update, delete.
 */
export const getClient = async () => {
	const client = new Client({ connectionString: env.DATABASE_CONNECTION });
	await client.connect();
	const db = drizzle(client, { schema });
	return db;
};

/**
 * get drizzle instance with pool client which should be used in hooks.server.ts for selecting data.
 * don't use pool client for transaction such as insert, update, delete.
 */
export const getPoolClient = async () => {
	const pool = new Pool({ connectionString: env.DATABASE_CONNECTION });
	return drizzle(pool, { schema });
};
