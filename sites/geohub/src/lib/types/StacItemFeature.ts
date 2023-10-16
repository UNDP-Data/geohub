import type { Link } from './Link';
import type { StacAsset } from './StacAsset';

export interface StacItemFeature {
	type: 'Feature';
	stac_version: string;
	id: string;
	geometry: {
		type: string;
		coordinates: [number, number] | [number, number][] | [number, number][][];
	};
	bbox: [number, number, number, number];
	properties: { [key: string]: string };
	links: Link[];
	assets: { [key: string]: StacAsset };
	collection?: string;
}
