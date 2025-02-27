import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { storymapInGeohub } from '$lib/server/schema';

/**
 * check if storymap exists in database
 * @param id style ID
 * @returns if true, exists
 */
export const storymapExists = async (id: string) => {
	const st = await db
		.select({ id: storymapInGeohub.id })
		.from(storymapInGeohub)
		.where(eq(storymapInGeohub.id, id));
	return st && st.length > 0;
};
