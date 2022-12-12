import { Storage } from './Storage';
import { Tag } from './Tag';

export interface Dataset {
	id: string;
	url: string;
	is_raster: boolean;
	name: string;
	description?: string;
	source?: string;
	license?: string;
	bounds: [number, number, number, number];
	createdat: string;
	updatedat: string;
	storage: Storage;
	tags?: Tag[];
}
