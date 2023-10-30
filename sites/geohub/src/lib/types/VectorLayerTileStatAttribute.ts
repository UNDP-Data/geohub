export interface VectorLayerTileStatAttribute {
	attribute: string;
	count: number;
	type: string;
	values: string[] | number[];
	min?: number;
	max?: number;
	mean?: number;
	median?: number;
	std?: number;
	histogram?: {
		bins: number[];
		count: number[];
	};
}
