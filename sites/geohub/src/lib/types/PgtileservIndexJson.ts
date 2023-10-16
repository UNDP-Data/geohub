export interface PgtileservLayer {
	type: string;
	id: string;
	name: string;
	schema: string;
	description: string;
	detailurl: string;
}

export interface PgtileservIndexJson {
	[key: string]: PgtileservLayer;
}
