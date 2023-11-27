export const StacApis = [
	{
		id: 'microsoft-pc',
		name: 'Microsoft Planetary Computer',
		url: `https://planetarycomputer.microsoft.com/api/stac/v1`,
		type: 'api'
	},
	{
		id: 'earth-search',
		name: 'Earth Search',
		url: `https://earth-search.aws.element84.com/v1/`,
		type: 'api'
	},
	{
		id: 'maxar-opendata',
		name: 'Maxar Open Data',
		url: `https://maxar-opendata.s3.amazonaws.com/events/catalog.json`,
		type: 'catalog'
	},
	{
		id: 'capella-open-data',
		name: 'Capella Open Data',
		url: `https://capella-open-data.s3.us-west-2.amazonaws.com/stac/capella-open-data-by-product-type/catalog.json`,
		type: 'catalog'
	},
	{
		id: 'jaxa',
		name: 'STAC for JAXA Earth database (COG)',
		url: `https://data.earth.jaxa.jp/stac/cog/v1/catalog.json`,
		type: 'catalog'
	},
	{
		id: 'nz-imagery',
		name: 'New Zealand Imagery',
		url: `https://nz-imagery.s3-ap-southeast-2.amazonaws.com/catalog.json`,
		type: 'catalog'
	}
];
