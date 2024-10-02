import { db } from '$lib/server/db';
import { styleFavouriteInGeohub } from '../schema';
import { count, eq } from 'drizzle-orm';

export const getStyleStarCount = async (style_id: number) => {
	const result = await db
		.select({ count: count() })
		.from(styleFavouriteInGeohub)
		.where(eq(styleFavouriteInGeohub.styleId, style_id))
		.groupBy(styleFavouriteInGeohub.styleId);

	return result.length === 0 ? 0 : result[0].count;
};
