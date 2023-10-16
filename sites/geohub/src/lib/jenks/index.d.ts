export declare class Jenks {
	private data;
	private n_classes;
	constructor(data: number[], classes: number);
	private getMatrices;
	breaks(data: number[], lower_class_limits: number[][], n_classes: number): number[];
	naturalBreak(): number[] | null;
}
