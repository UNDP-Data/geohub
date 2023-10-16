export interface StacAsset {
	href: string;
	title?: string;
	description?: string;
	type?: string;
	roles?: string[];
	'raster:bands'?: [
		{
			name: string;
			nodata?: 0;
			sampling?: string;
			data_type?: string;
			description?: string;
			spatial_resolution?: 10;
		}
	];
}
