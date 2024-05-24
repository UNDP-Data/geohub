import { StacItemFeature } from './StacItemFeature';
import { StacLink } from './StacLink';
export interface StacItemFeatureCollection {
    type: 'FeatureCollection';
    features: StacItemFeature[];
    links: StacLink[];
}
