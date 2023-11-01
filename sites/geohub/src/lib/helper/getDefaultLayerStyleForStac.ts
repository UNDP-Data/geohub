import type { DatasetDefaultLayerStyle, DatasetFeature } from '$lib/types';

export const getDefaltLayerStyleForStac = async (feature: DatasetFeature) => {
	const stac = feature.properties.tags.find((t) => t.key === 'stac')?.value;
	const collection = feature.properties.tags.find((t) => t.key === 'collection')?.value;
	const items = feature.properties.tags.filter((t) => t.key === 'item')?.map((t) => t.value);
	const asset = feature.properties.tags.find((t) => t.key === 'asset')?.value;
	const res = await fetch(`/api/stac/style/${stac}/${collection}/${items.join('/')}/${asset}`);
	if (!res.ok) {
		return;
	}
	const json: DatasetDefaultLayerStyle = await res.json();
	return json;
};
