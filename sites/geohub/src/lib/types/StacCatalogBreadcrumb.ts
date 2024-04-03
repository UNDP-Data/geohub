import type { BreadcrumbPage } from '@undp-data/svelte-undp-components';

export interface StacCatalogBreadcrumb extends BreadcrumbPage {
	dataUrl: string;
	type: 'Catalog' | 'Collection' | 'Item';
}
