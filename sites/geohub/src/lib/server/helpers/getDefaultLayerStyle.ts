import type { DatasetDefaultLayerStyle } from '$lib/types/DatasetDeaultLayerStyle';
import { db } from '$lib/server/db';
import { datasetDefaultstyleInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';

export const getDefaultLayerStyle = async (
	dataset_id: string,
	layer_id: string,
	layer_type: string
) => {
	const data = await db
		.select({
			dataset_id: datasetDefaultstyleInGeohub.datasetId,
			layer_id: datasetDefaultstyleInGeohub.layerId,
			layer_type: datasetDefaultstyleInGeohub.layerType,
			source: datasetDefaultstyleInGeohub.source,
			style: datasetDefaultstyleInGeohub.style,
			colormap_name: datasetDefaultstyleInGeohub.colormapName,
			classification_method: datasetDefaultstyleInGeohub.classificationMethod,
			classification_method_2: datasetDefaultstyleInGeohub.classificationMethod2,
			created_user: datasetDefaultstyleInGeohub.createdUser,
			createdat: datasetDefaultstyleInGeohub.createdat,
			updatedat: datasetDefaultstyleInGeohub.updatedat,
			updated_user: datasetDefaultstyleInGeohub.updatedUser
		})
		.from(datasetDefaultstyleInGeohub)
		.where(
			sql`
        ${datasetDefaultstyleInGeohub.datasetId} = ${dataset_id}
        AND ${datasetDefaultstyleInGeohub.layerId} = ${layer_id}
        AND ${datasetDefaultstyleInGeohub.layerType} = ${layer_type}
        `
		);

	if (data.length === 0) {
		return;
	}
	return data[0] as DatasetDefaultLayerStyle;
};
