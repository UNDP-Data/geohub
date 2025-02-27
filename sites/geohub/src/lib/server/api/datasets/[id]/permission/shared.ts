import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { datasetInGeohub } from '$lib/server/schema';

/**
 * check if dataset exists in database
 * @param id dataset ID
 * @returns if true, exists
 */
export const datasetExists = async (id: string) => {
	const ds = await db
		.select({ id: datasetInGeohub.id })
		.from(datasetInGeohub)
		.where(eq(datasetInGeohub.id, id));
	return ds && ds.length > 0;
};
