import type { StacAsset } from './StacAsset';

export interface AssetOptions {
	url: string;
	assetName: string;
	title: string;
	asset: StacAsset;
	collectionId: string;
}
