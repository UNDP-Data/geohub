import type { DatasetDefaultLayerStyle, DatasetFeature, VectorLayerTypes } from '$lib/types';

export const getDefaltLayerStyle = async (
	feature: DatasetFeature,
	layer_id: string,
	layerType: VectorLayerTypes | 'raster',
	colormap_name?: string
) => {
	const res = await fetch(
		`/api/datasets/${feature.properties.id}/style/${layer_id}/${layerType}${
			colormap_name ? `?colormap_name=${colormap_name}` : ''
		}`
	);
	if (!res.ok) {
		return;
	}
	const json: DatasetDefaultLayerStyle = await res.json();
	return json;
};
