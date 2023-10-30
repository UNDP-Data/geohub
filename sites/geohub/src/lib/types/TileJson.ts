//https://github.com/mapbox/tilejson-spec/tree/master/3.0.0
export interface TileJson {
	tilejson: '3.0.0';
	name?: string;
	description?: string;
	version?: '1.0.0';
	attribution?: string;
	scheme?: 'xyz';
	tiles: string[];
	minzoom?: number;
	maxzoom?: number;
	bounds?: [number, number, number, number];
	center?: [number, number, number];
	data?: string[];
	fillzoom?: number;
	grids?: string[];
	legend?: string;
	template?: string;
	geometrytype?: string;
	vector_layers: {
		id: string;
		fields: { [key: string]: string };
		description?: string;
		minzoom?: number;
		maxzoom?: number;
	}[];
}
