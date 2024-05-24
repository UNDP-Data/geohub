import { StacAsset } from './StacAsset';
import { StacLink } from './StacLink';
export interface StacCollection {
    type: 'Collection';
    stac_version: string;
    id: string;
    title?: string;
    description: string;
    keywords?: string[];
    license: string;
    providers?: {
        name: string;
        description?: string;
        roles?: ['licensor' | 'producer' | 'processor' | 'host'];
        url?: string;
    }[];
    extent: {
        spatial: {
            bbox: [[number, number, number, number]];
        };
        temporal: {
            interval: [[string, string | null]];
        };
    };
    summaries: {
        [key: string]: {
            minimum: string | number;
            maximum: string | number;
        } | JSON;
    };
    links: StacLink[];
    assets?: {
        [key: string]: StacAsset;
    };
}
