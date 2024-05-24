import type { DatasetFeature } from './DatasetFeature';
import type { StacLink } from './StacLink';
export interface DatasetFeatureCollection {
    type: 'FeatureCollection';
    features: DatasetFeature[];
    links: StacLink[];
}
