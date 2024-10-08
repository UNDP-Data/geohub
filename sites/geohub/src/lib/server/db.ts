import { drizzle, type PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from '$lib/server/schema.js';
import { PgTransaction } from 'drizzle-orm/pg-core';

const queryClient = postgres(env.DATABASE_CONNECTION);

let debug = false;
if (env.DATABASE_DEBUG === 'true') {
	debug = true;
}

export const db = drizzle(queryClient, { schema, logger: debug });

export type TransactionSchema = PgTransaction<
	PostgresJsQueryResultHKT,
	typeof import('$lib/server/schema')
>;
