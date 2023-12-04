export const StacProducts = [
	{
		id: 'sentinel-2-l2a',
		products: [
			{
				name: 'NDVI',
				label: 'Normalized Difference Vegetation Index',
				expression: '(nir-red)/(nir+red)'
			},
			{
				name: 'NDWI',
				label: 'Normalized Difference Water Index',
				expression: '(green-nir)/(green+nir)'
			},
			{
				name: 'NDMI',
				label: 'Normalized Difference Moisture Index',
				expression: '(nir-swir)/(nir+swir)'
			}
		]
	}
];

export const TestTitilerUrl = 'https://titiler.cyverse.org';
