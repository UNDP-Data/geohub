import { storymapFavouriteInGeohub } from '../schema';
import { count, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const getStoryStarCount = async (storymap_id: string) => {
	const result = await db
		.select({ count: count() })
		.from(storymapFavouriteInGeohub)
		.where(eq(storymapFavouriteInGeohub.storymapId, storymap_id))
		.groupBy(storymapFavouriteInGeohub.storymapId);

	return result.length === 0 ? 0 : result[0].count;
};
