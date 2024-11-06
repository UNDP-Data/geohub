export interface VectorLayerMetadata {
	id: string;
	fields: {
		[key: string]: string;
	};
	description?: string;
	minzoom?: number;
	maxzoom?: number;
}
