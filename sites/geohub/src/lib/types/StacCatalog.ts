import type { Link } from './Link';

export interface StacCatalog {
	type: 'Catalog';
	stac_version: string;
	id: string;
	title: string;
	description: string;
	links: Link[];
}
