import type { DatasetFeature } from './DatasetFeature';
import type { Pages } from './Pages';
import type { Link } from './Link';

export interface DatasetFeatureCollection {
	type: 'FeatureCollection';
	features: DatasetFeature[];
	links: Link[];
	pages: Pages;
}
