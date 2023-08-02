export interface MartinLayerMetadata {
	id: string;
	schema: string;
	table: string;
	srid: number;
	geometry_column: string;
	bounds: number[];
	extent: number;
	buffer: number;
	geometry_type: string;
	properties: { [key: string]: string };
}
