export interface RasterAlgorithmParameter {
	default: number;
	title: string;
	type: 'integer' | 'number' | 'boolean' | 'string';
	description?: string;
	exclusiveMaximum?: number;
	maximum?: number;
	exclusiveMinimum?: number;
	minimum?: number;
}

export interface RasterAlgorithm {
	title?: string;
	description?: string;
	inputs: {
		nbands: number;
		bands?: [{ title: string; description: string; required: boolean }];
	};
	outputs: {
		nbands: number;
		dtype: string;
		min?: number[];
		max?: number[];
	};
	parameters?: {
		[key: string]: RasterAlgorithmParameter;
	};
}
