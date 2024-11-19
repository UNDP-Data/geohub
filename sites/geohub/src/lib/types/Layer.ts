import type { TabNames } from '$lib/config/AppConfig';
import type { RasterTileMetadata } from './RasterTileMetadata';
import type { DatasetFeature } from './DatasetFeature';
import type {
	VectorTileMetadata,
	ClassificationMethodTypes
} from '@undp-data/svelte-undp-components';

export interface Layer {
	id: string;
	name: string;
	info?: RasterTileMetadata | VectorTileMetadata;
	children?: Layer[];
	parentId?: string;
	dataset?: DatasetFeature;
	colorMapName?: string;
	colorMapNameLabel?: string;
	classificationMethod?: ClassificationMethodTypes;
	classificationMethod_2?: ClassificationMethodTypes;
	classificationMethodLabel?: ClassificationMethodTypes;
	activeTab?: TabNames;
	isExpanded?: boolean;
}
