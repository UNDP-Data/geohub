import type { DatasetDefaultLayerStyle, DatasetFeature, StacProduct } from '$lib/types';

export const getDefaultLayerStyleForStacProducts = async (
	feature: DatasetFeature,
	colormap_name?: string
) => {
	console.log(feature);
	const stac = feature.properties.tags.find((t) => t.key === 'stac')?.value;
	const stacApiType = feature.properties.tags.find((t) => t.key === 'stacApiType')?.value;
	if (stacApiType !== 'api') return;
	const collection = feature.properties.tags.find((t) => t.key === 'collection')?.value;
	const items = feature.properties.tags.filter((t) => t.key === 'item')?.map((t) => t.value);
	const product = feature.properties.tags?.find((t) => t.key === 'product')?.value;
	const stacProduct: StacProduct = {
		stac_id: stac,
		collection_id: collection,
		product_id: `${product}`,
		assets: feature.properties.tags.find((t) => t.key === 'product_assets')?.value,
		label: feature.properties.tags.find((t) => t.key === 'product_label')?.value,
		expression: feature.properties.tags.find((t) => t.key === 'product_expression')?.value,
		description: feature.properties.tags.find((t) => t.key === 'product_description')?.value
	};

	const res = await fetch(
		`/api/stac/style/${stac}/${collection}/${items.join('/')}/products${
			colormap_name ? `?colormap_name=${colormap_name}` : ''
		}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(stacProduct)
		}
	);
	if (!res.ok) {
		return;
	}
	const json: DatasetDefaultLayerStyle = await res.json();
	return json;
};
