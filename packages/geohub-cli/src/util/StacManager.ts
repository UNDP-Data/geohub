import { generateHashKey } from '../helpers';
import {
	Dataset,
	StacCatalog,
	StacCollections,
	StacItemFeatureCollection,
	Storage
} from '../interfaces';

class StacManager {
	private stacUrl: string;
	constructor(stacUrl: string) {
		this.stacUrl = stacUrl;
	}

	public async load() {
		const storage = await this.loadStorage();
		const datasets: Dataset[] = await this.loadDatasets(storage);

		return {
			storages: [storage],
			datasets: datasets
		};
	}

	private async loadStorage() {
		const res = await fetch(this.stacUrl);
		const stacCatalog: StacCatalog = await res.json();

		const storage: Storage = {
			id: generateHashKey(this.stacUrl),
			name: stacCatalog.id,
			url: this.stacUrl,
			label: stacCatalog.title,
			description: stacCatalog.description,
			icon: '/stac.png',
			tags: [
				{
					key: 'type',
					value: 'stac'
				}
			]
		};
		return storage;
	}

	private async loadDatasets(storage: Storage) {
		const res = await fetch(`${storage.url}/collections`);
		const stacCollections: StacCollections = await res.json();

		const datasets: Dataset[] = [];

		for (let i = 0; i < stacCollections.collections.length; i++) {
			const collection = stacCollections.collections[i];

			const itemLink = collection.links.find((link) => link.rel === 'items');
			if (!itemLink) continue;

			const item = await this.getItem(itemLink.href);
			if (!item) continue;
			const assets = Object.values(item.assets).filter(
				(asset) => asset.type === 'image/tiff; application=geotiff; profile=cloud-optimized'
			);
			if (assets.length === 0) continue;

			const now = new Date().toISOString();
			let bounds: [number, number, number, number] = [-180, -90, 180, 90];
			if (collection.extent.spatial.bbox.length > 0) {
				bounds = collection.extent.spatial.bbox[0];
			}
			const temporal = collection.extent.temporal.interval[0];
			const dataset: Dataset = {
				id: generateHashKey(itemLink.href),
				url: itemLink.href,
				is_raster: true,
				name: collection.title || collection.id,
				description: collection.description,
				source: storage.label,
				license: collection.license,
				bounds: bounds,
				createdat: temporal[0],
				updatedat: temporal[1] ? temporal[1] : now,
				storage: storage,
				tags: [
					{
						key: 'type',
						value: 'stac'
					},
					{
						key: 'stac',
						value: storage.name
					}
				]
			};

			if (collection.providers) {
				dataset.source = collection.providers.map((provider) => provider.name).join(', ');
			}

			if (collection.keywords) {
				collection.keywords.forEach((keyword) => {
					dataset.tags?.push({
						key: 'keyword',
						value: keyword
					});
				});
			}

			datasets.push(dataset);
		}
		return datasets;
	}

	private async getItem(itemUrl: string) {
		const url = `${itemUrl}?limit=1`;
		const res = await fetch(url);
		const fc: StacItemFeatureCollection = await res.json();
		if (fc.features.length === 0) return;
		return fc.features[0];
	}
}

export default StacManager;
