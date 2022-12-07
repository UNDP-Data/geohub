import { Tag } from './Tag';

export interface Storage {
	id: string;
	name: string;
	url: string;
	label: string;
	description: string;
	icon: string;
	tags: Tag[];
}
