import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { styleInGeohub } from '$lib/server/schema';

/**
 * check if style exists in database
 * @param id style ID
 * @returns if true, exists
 */
export const styleExists = async (id: number) => {
	const st = await db
		.select({ id: styleInGeohub.id })
		.from(styleInGeohub)
		.where(eq(styleInGeohub.id, id));
	return st && st.length > 0;
};
