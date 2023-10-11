import type { StacItemFeature } from './StacItemFeature';
import type { Link } from './Link';

export interface StacItemFeatureCollection {
	type: 'FeatureCollection';
	features: StacItemFeature[];
	links: Link[];
	totalCount: number;
}
