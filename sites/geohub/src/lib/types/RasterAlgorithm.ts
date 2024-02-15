export interface RasterAlgorithmParameter {
	default: number;
	title: string;
	type: 'integer' | 'number';
}

export interface RasterAlgorithm {
	inputs: {
		nbands: number;
	};
	outputs: {
		nbands: number;
		dtype: string;
		min?: number;
		max?: number;
	};
	parameters?: {
		[key: string]: RasterAlgorithmParameter;
	};
}
