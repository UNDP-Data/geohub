import type { UserConfig } from '$lib/config/DefaultUserConfig';
import type {
	DatasetDefaultLayerStyle,
	DatasetFeature,
	RasterTileMetadata,
	VectorTileMetadata
} from '$lib/types';

export interface DefaultStyleTemplate {
	dataset: DatasetFeature;
	metadata: RasterTileMetadata | VectorTileMetadata;
	config: UserConfig;

	create: (colormap_name?: string) => Promise<DatasetDefaultLayerStyle>;

	getMetadata: () => Promise<RasterTileMetadata | VectorTileMetadata>;
}
