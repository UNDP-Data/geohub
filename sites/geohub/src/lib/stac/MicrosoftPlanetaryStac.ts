import type {
	DatasetFeature,
	Stac,
	StacCollection,
	StacItemFeature,
	StacItemFeatureCollection,
	Tag
} from '$lib/types';
import type { LngLatBounds, RasterSourceSpecification } from 'maplibre-gl';
import type { StacTemplate } from './StacTemplate';
import { AccessLevel } from '$lib/config/AppConfig';
import { generateHashKey, getBase64EncodedUrl } from '$lib/helper';

/**
 * References
 * https://planetarycomputer.microsoft.com/catalog
 * https://planetarycomputer.microsoft.com/docs
 */
export default class MicrosoftPlanetaryStac implements StacTemplate {
	public stacId = 'microsoft-pc';
	public apiUrl: string;
	public stac: Stac;

	public collection: string;

	public stacCollection: StacCollection;

	constructor(colleciton: string, stac: Stac) {
		this.collection = colleciton;
		this.stac = stac;
		this.apiUrl = this.stac.url;
	}

	public cloudCoverPropName = 'eo:cloud_cover';
	public hasCloudCoverProp = false;

	public intervalFrom: string;
	public intervalTo: string;

	public getFirstAsset = async () => {
		const res = await fetch(`${this.apiUrl}/collections/${this.collection}/items?limit=1`);
		if (!res.ok) {
			return undefined;
		}

		const stacItemFeatureCollection: StacItemFeatureCollection = await res.json();
		if (stacItemFeatureCollection.features.length === 0) {
			return undefined;
		}
		const stacItemFeature = stacItemFeatureCollection.features[0];
		this.hasCloudCoverProp = this.cloudCoverPropName in stacItemFeature.properties ? true : false;
		return stacItemFeature;
	};

	public search = async (
		bounds: LngLatBounds,
		limit = 10,
		minCloudCover = 5,
		searchFrom: string = undefined,
		searchTo: string = undefined
	) => {
		const sortby = 'datetime';

		if (!searchFrom) {
			searchFrom = this.intervalFrom;
		}
		if (!searchTo) {
			searchTo = this.intervalTo;
			if (!searchTo) {
				searchTo = new Date().toISOString();
			}
		}

		const payload = {
			collections: [this.collection],
			'filter-lang': 'cql2-json',
			filter: {
				op: 'and',
				args: [
					{
						op: 's_intersects',
						args: [
							{
								property: 'geometry'
							},
							{
								type: 'Polygon',
								coordinates: [
									[
										[bounds.getSouthWest().lng, bounds.getSouthWest().lat],
										[bounds.getNorthEast().lng, bounds.getSouthWest().lat],
										[bounds.getNorthEast().lng, bounds.getNorthEast().lat],
										[bounds.getSouthWest().lng, bounds.getNorthEast().lat],
										[bounds.getSouthWest().lng, bounds.getSouthWest().lat]
									]
								]
							}
						]
					}
				]
			},
			limit: limit,
			sortby: [
				{
					field: sortby,
					direction: 'asc'
				}
			]
		};

		if (searchFrom !== searchTo) {
			payload.filter.args.push({
				op: 'anyinteracts',
				args: [
					{
						property: 'datetime'
					},
					{
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						interval: [searchFrom, searchTo]
					}
				]
			});
		}

		if (this.hasCloudCoverProp) {
			payload.filter.args.push({
				op: '<=',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				args: [{ property: this.cloudCoverPropName }, minCloudCover]
			});
		}

		const res = await fetch(`${this.apiUrl}/search`, {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'content-type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		const stacItemFeatureCollection: StacItemFeatureCollection = await res.json();
		return stacItemFeatureCollection;
	};

	public getStacCollection = async () => {
		const url = `${this.apiUrl}/collections/${this.collection}`;
		const res = await fetch(url);
		const feature: StacCollection = await res.json();
		this.stacCollection = feature;

		const interval = this.stacCollection.extent.temporal.interval;
		const first = interval[0];
		const last = interval[interval.length - 1];
		this.intervalFrom = first[0];
		this.intervalTo = last[last.length - 1];

		return feature;
	};

	public getStacItem = async (itemId: string) => {
		const url = `${this.apiUrl}/collections/${this.collection}/items/${itemId}`;
		const res = await fetch(url);
		const feature: StacItemFeature = await res.json();
		return feature;
	};

	private getStacClassmap = (asset: string) => {
		const classesMap = {};
		// FixME: There is no standard object for the classes labels.
		if (this.stacCollection.item_assets[asset]) {
			let classesObj;
			if (this.stacCollection.item_assets[asset]['classification:classes']) {
				classesObj = this.stacCollection.item_assets[asset]['classification:classes'];
			} else if (this.stacCollection.item_assets[asset]['file:values']) {
				classesObj = this.stacCollection.item_assets[asset]['file:values'];
			} else {
				return classesMap;
			}

			if (!classesObj) {
				return classesMap;
			}
			classesObj.forEach((item) => {
				if (item['description']) {
					classesMap[item['value']] = item['description'];
				} else if (item['summary']) {
					classesMap[item['values']] = item['summary'];
				} else {
					return;
				}
			});
		}
		return classesMap;
	};

	private getMsStacToken = async () => {
		const url = `${this.apiUrl.replace('stac', 'sas')}/token/${this.collection}`;
		const res = await fetch(url);
		const json = await res.json();
		const token = json.token;
		return token;
	};

	public generateDataSetFeature = async (item: StacItemFeature, assetName: string) => {
		const assetItem = item.assets[assetName];
		const assetUrl = assetItem.href;

		const providers: Tag[] = this.stacCollection.providers?.map((p) => {
			return { key: 'provider', value: p.name };
		});

		const sasToken = await this.getMsStacToken();

		const feature: DatasetFeature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[item.bbox[0], item.bbox[1]],
						[item.bbox[0], item.bbox[3]],
						[item.bbox[2], item.bbox[1]],
						[item.bbox[2], item.bbox[3]],
						[item.bbox[0], item.bbox[1]]
					]
				]
			},
			properties: {
				id: generateHashKey(assetUrl),
				name: `${this.stacCollection.title} - ${assetName}`,
				description: this.stacCollection.description,
				license: this.stacCollection.license,
				url: `${assetUrl}?${sasToken}`,
				is_raster: true,
				access_level: AccessLevel.PUBLIC,
				tags: [
					{ key: 'type', value: 'stac' },
					{ key: 'stacApiType', value: 'api' },
					{ key: 'stacType', value: 'cog' },
					{ key: 'stac', value: this.stacId },
					{ key: 'collection', value: this.collection },
					{ key: 'item', value: item.id },
					{ key: 'asset', value: assetName },
					...providers
				]
			}
		};

		if (Object.keys(item.properties).length > 0) {
			feature.properties['stac_properties'] = item.properties;
		}

		const classmap = this.getStacClassmap(assetName);
		if (Object.keys(classmap).length > 0) {
			feature.properties.tags.push({
				key: 'classmap',
				value: JSON.stringify(classmap)
			});
		}

		return feature;
	};

	public generateCollectionDatasetFeature = async () => {
		const providers: Tag[] = this.stacCollection.providers?.map((p) => {
			return { key: 'provider', value: p.name };
		});

		const bbox = this.getMaxExtent();

		const collectionUrl = this.stacCollection.links.find((l) => l.rel === 'items').href;

		const feature: DatasetFeature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[bbox[0], bbox[1]],
						[bbox[0], bbox[3]],
						[bbox[2], bbox[1]],
						[bbox[2], bbox[3]],
						[bbox[0], bbox[1]]
					]
				]
			},
			properties: {
				id: generateHashKey(collectionUrl),
				name: `${this.stacCollection.title}`,
				description: this.stacCollection.description,
				license: this.stacCollection.license,
				url: collectionUrl,
				is_raster: true,
				access_level: AccessLevel.PUBLIC,
				tags: [
					{ key: 'type', value: 'stac' },
					{ key: 'stacType', value: 'collection' },
					{ key: 'stac', value: this.stacId },
					{ key: 'collection', value: this.collection },
					...providers
				]
			}
		};
		return feature;
	};

	public updateSasToken = async (
		dataset: DatasetFeature,
		source: RasterSourceSpecification,
		currentTime: Date,
		callback: (mosaicjsonUrl: string, content: string) => Promise<void>
	) => {
		const stac = dataset.properties.tags?.find((t) => t.key === 'stac')?.value;
		if (stac === 'microsoft-pc') {
			// check the token expiry datatime and update
			const stacType = dataset.properties.tags?.find((t) => t.key === 'stacType')?.value;
			const collection = dataset.properties.tags?.find((t) => t.key === 'collection')?.value;
			if (stacType === 'mosaicjson') {
				// mosaicjson
				const itemUrls = dataset.properties.tags.filter((t) => t.key === 'itemUrl');
				if (itemUrls.length > 0) {
					const isExpired = this.checkMicrosoftSasTokenExpiry(itemUrls[0].value, currentTime);
					if (isExpired) {
						// update the following tokens
						// dataset.properties.tags.itemUrl
						// dataset.properties.links.rel=info (encoded)
						// dataset.properties.links.rel=statistics (encoded)
						// dataset.properties.url (mosaijson)

						const microsoft = new MicrosoftPlanetaryStac(collection, this.stac);
						const newToken = await microsoft.getMsStacToken();
						itemUrls.forEach((item) => {
							const urlWithoutToken = item.value.split('?')[0];
							item.value = `${urlWithoutToken}?${newToken}`;
						});
						const rels = ['info', 'statistics'];
						rels.forEach((rel) => {
							const link = dataset.properties.links.find((l) => l.rel === rel);
							const href = new URL(link.href);

							let itemUrl = href.searchParams.get('url');
							const urlWithoutToken = itemUrl.split('?')[0];
							itemUrl = `${urlWithoutToken}?${newToken}`;
							const b64EncodedUrl = getBase64EncodedUrl(itemUrl);

							href.searchParams.set('url', b64EncodedUrl);
							link.href = href.toString();
						});

						const mosaicjsonUrl = dataset.properties.url;
						const res = await fetch(mosaicjsonUrl);
						const mosaicjson = await res.json();
						const tiles = mosaicjson.tiles[''];
						const newTiles = [];
						for (const tile of tiles) {
							newTiles.push(`${tile.split('?')[0]}?${newToken}`);
						}
						mosaicjson.tiles[''] = newTiles;
						await callback(mosaicjsonUrl, JSON.stringify(mosaicjson));
					}
				}
			} else if (stacType === 'cog') {
				// cog
				const isExpired = this.checkMicrosoftSasTokenExpiry(dataset.properties.url, currentTime);
				if (isExpired) {
					// update the following tokens
					// dataset.properties.url (COG)
					// dataset.properties.links.rel=download
					// dataset.properties.links.rel=info (encoded)
					// dataset.properties.links.rel=statistics (encoded)
					// dataset.properties.links.rel=tiles (encoded)
					// dataset.properties.links.rel=tilejson (encoded)
					// style.sources.[dataset id].tiles

					const microsoft = new MicrosoftPlanetaryStac(collection, this.stac);
					const newToken = await microsoft.getMsStacToken();
					const urlWithoutToken = dataset.properties.url.split('?')[0];
					const newUrl = `${urlWithoutToken}?${newToken}`;
					const b64EncodedUrl = getBase64EncodedUrl(newUrl);

					dataset.properties.url = newUrl;
					const downloadLink = dataset.properties.links.find((l) => l.rel === 'download');
					downloadLink.href = newUrl;
					const rels = ['info', 'statistics', 'tiles', 'tilejson'];
					rels.forEach((rel) => {
						const link = dataset.properties.links.find((l) => l.rel === rel);
						const href = new URL(link.href);
						href.searchParams.set('url', b64EncodedUrl);
						link.href = href.toString();
					});

					if (source) {
						const newTiles = [];
						for (const tile of source.tiles) {
							const href = new URL(tile);
							href.searchParams.set('url', b64EncodedUrl);
							const newTile = `${href.origin}${decodeURIComponent(href.pathname)}${href.search}`;
							newTiles.push(newTile);
						}
						source.tiles = newTiles;
					}
				}
			}
		}
		return {
			dataset,
			source
		};
	};

	private checkMicrosoftSasTokenExpiry = (url: string, currentTime = new Date()) => {
		const urlObj = new URL(url);
		const expiry = urlObj.searchParams.get('se');
		const expiryDate = new Date(expiry);
		const isExpired = currentTime > expiryDate;
		return isExpired;
	};

	public getMaxExtent = () => {
		const bboxes = this.stacCollection.extent.spatial.bbox;
		let minx: number;
		let miny: number;
		let maxx: number;
		let maxy: number;
		bboxes.forEach((bbox) => {
			if (!minx || bbox[0] < minx) {
				minx = bbox[0];
			}
			if (!miny || bbox[1] < miny) {
				miny = bbox[1];
			}
			if (!maxx || bbox[2] > maxx) {
				maxx = bbox[2];
			}
			if (!maxy || bbox[3] > maxy) {
				maxy = bbox[3];
			}
		});

		return [minx, miny, maxx, maxy];
	};
}
