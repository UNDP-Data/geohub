export interface RawDataset {
	id: string;
	name: string;
	url: string;
	contentLength: number;
	createdat: string;
	updatedat: string;
	error?: string;
}
export interface IngestedDataset {
	id?: string;
	name?: string;
	url?: string;
	contentLength?: number;
	createdat?: string;
	updatedat?: string;
	processing?: boolean;
	processingFile?: string;
}

export interface IngestingDataset {
	raw: RawDataset;
	datasets?: IngestedDataset[];
}
