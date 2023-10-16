export interface PgtileservDetailJson {
	id: string;
	schema: string;
	name: string;
	description: string;
	properties: {
		name: string;
		type: string; // int4, float5, varchar...
		description: string;
	}[];
	geometrytype: string;
	center: [number, number];
	bounds: [number, number, number, number];
	minzoom: number;
	maxzoom: number;
	tileurl: string;
}
