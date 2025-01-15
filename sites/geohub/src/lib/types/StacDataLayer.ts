import type { Layer } from './Layer';
import type { LayerCreationInfo } from './LayerCreationInfo';

export type StacDataLayer = LayerCreationInfo & { geohubLayer?: Layer };
