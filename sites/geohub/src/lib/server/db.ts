import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from '$lib/server/schema.js';

const queryClient = postgres(env.DATABASE_CONNECTION);
export const db = drizzle(queryClient, { schema });
