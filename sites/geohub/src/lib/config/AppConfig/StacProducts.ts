export const StacProducts = [
	{
		collection_id: 'sentinel-2-l2a',
		products: [
			{
				name: 'NDVI',
				label: 'Normalized Difference Vegetation Index',
				expression: '(nir-red)/(nir+red)',
				assets: ['red', 'nir']
			},
			{
				name: 'NDWI',
				label: 'Normalized Difference Water Index',
				expression: '(green-nir)/(green+nir)',
				assets: ['green', 'nir']
			},
			{
				name: 'NDMI',
				label: 'Normalized Difference Moisture Index',
				expression: '(nir-swir)/(nir+swir)',
				assets: ['nir', 'swir']
			}
		]
	}
];

export const TestTitilerUrl = 'https://titiler.cyverse.org';
