import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { styleInGeohub } from '$lib/server/schema';
import { count } from 'drizzle-orm';

/**
 * Get the total count of styles stored in database
 * GET: ./api/style/count
 */
export const GET: RequestHandler = async () => {
	const result = await db.select({ count: count() }).from(styleInGeohub);
	return new Response(JSON.stringify(result.length === 0 ? 0 : result[0].count));
};
