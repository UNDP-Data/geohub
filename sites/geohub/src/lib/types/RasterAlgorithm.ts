export interface RasterAlgorithmParameter {
	default: number;
	title: string;
	type: 'integer' | 'number' | 'boolean' | 'string';
	description?: string;
	exclusiveMaximum?: number;
	maximum?: number;
	exclusiveMinimum?: number;
	minimum?: number;
	unit?: string;
	options_descriptions?: string[];
}

export interface RasterAlgorithm {
	title?: string;
	description?: string;
	inputs: {
		nbands: number;
		description?: string;
		bands?: [{ title: string; description: string; required: boolean; keywords?: string[] }];
	};
	outputs: {
		nbands: number;
		dtype: string;
		min?: number[];
		max?: number[];
		description?: string;
		unit?: string;
		colormap_name?: string;
	};
	parameters?: {
		[key: string]: RasterAlgorithmParameter;
	};
}
