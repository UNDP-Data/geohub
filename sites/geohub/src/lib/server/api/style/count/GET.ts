import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { db } from '$lib/server/db';
import { styleInGeohub } from '$lib/server/schema';
import { count } from 'drizzle-orm';

export const Output = z.object({
	count: z.number().describe('The number of saved styles')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get total count of styles';
	c.description = 'Get total count of styles';
	c.tags = ['style'];
	return c;
};

export default new Endpoint({ Output, Modifier }).handle(async () => {
	const result = await db.select({ count: count() }).from(styleInGeohub);
	const cnt = result.length === 0 ? 0 : result[0].count;
	return { count: cnt };
});
