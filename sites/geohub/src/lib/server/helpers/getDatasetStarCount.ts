import { db } from '$lib/server/db';
import { datasetFavouriteInGeohub } from '../schema';
import { count, eq } from 'drizzle-orm';

export const getDatasetStarCount = async (dataset_id: string) => {
	const result = await db
		.select({ count: count() })
		.from(datasetFavouriteInGeohub)
		.where(eq(datasetFavouriteInGeohub.datasetId, dataset_id))
		.groupBy(datasetFavouriteInGeohub.datasetId);

	return result.length === 0 ? 0 : result[0].count;
};
