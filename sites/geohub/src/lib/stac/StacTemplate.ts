import type {
	DatasetFeature,
	Stac,
	StacCollection,
	StacItemFeature,
	StacItemFeatureCollection
} from '$lib/types';
import type { LngLatBounds } from 'maplibre-gl';

export interface StacTemplate {
	/**
	 * STAC ID used in GeoHub
	 * e.g., microsoft-pc, earth-search
	 */
	stacId: string;
	/**
	 * STAC API Root URL
	 * e.g., https://planetarycomputer.microsoft.com/api/stac/v1
	 */
	apiUrl: string;

	/**
	 * Stac info
	 */
	stac: Stac;

	/**
	 * Collection ID
	 */
	collection: string;

	/**
	 * Property name for cloud cover
	 * if microsoft planetary, for example, it is 'eo:cloud_cover'
	 */
	cloudCoverPropName?: string;

	/**
	 * If true, the collection has cloud cover property
	 */
	hasCloudCoverProp: boolean;

	/**
	 * StacCollection object. It should be set by getStacCollection function
	 */
	stacCollection: StacCollection;

	/**
	 * The datatime which data is available from
	 * It should be set from `extent.temporal.interval`
	 */
	intervalFrom: string;

	/**
	 * The datatime which data is available from
	 * It should be set from `extent.temporal.interval`
	 */
	intervalTo: string | null;

	/**
	 * Get first asset from STAC. Also, in this function, exsitance of clould cover property should be inspected
	 * @returns StacItemFeature object
	 */
	getFirstAsset: () => Promise<StacItemFeature>;

	/**
	 * Search stac assets by the given bounds.
	 * @param bounds maplibre.LngLatBounds object
	 * @param minCloudCover optional. minimum cloud cover for searching
	 * @param limit optional. Limit number for searching
	 * @param searchFrom optional. Search date from
	 * @param searchTo optional. Search date to
	 * @returns StacItemFeatureCollection object
	 */
	search: (
		bounds: LngLatBounds,
		limit?: number,
		minCloudCover?: number,
		searchFrom?: string,
		searchTo?: string
	) => Promise<StacItemFeatureCollection>;

	/**
	 * Get stac collection object
	 * @returns StacColleciton object
	 */
	getStacCollection: () => Promise<StacCollection>;

	/**
	 * Get stac item by item ID
	 * @param itemId Stac item ID
	 * @returns StacItemFeature object
	 */
	getStacItem: (itemId: string) => Promise<StacItemFeature>;

	/**
	 * Generate DataSetDeature object for geohub
	 * @param item StacItemFeature
	 * @param assetName Asset name
	 * @returns DataSetDeature object
	 */
	generateDataSetFeature: (item: StacItemFeature, assetName: string) => Promise<DatasetFeature>;

	/**
	 * Generate DatasetFeature object for registration to GeoHub database
	 * @returns DatasetFeature object
	 */
	generateCollectionDatasetFeature: () => Promise<DatasetFeature>;
}
