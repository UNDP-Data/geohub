import { StacLink } from './StacLink';
export interface StacCatalog {
    type: 'Catalog';
    stac_version: string;
    id: string;
    title: string;
    description: string;
    links: StacLink[];
}
