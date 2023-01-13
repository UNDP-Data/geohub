import {
	BlobServiceClient,
	ContainerClient,
	ServiceListContainersOptions,
	StorageSharedKeyCredential
} from '@azure/storage-blob';
import * as pmtiles from 'pmtiles';
import type {
	BandMetadata,
	ContainerMetadata,
	Dataset,
	RasterTileMetadata,
	Storage,
	Tag
} from '../interfaces';
import {
	cleanName,
	generateHashKey,
	generateSasToken,
	getBase64EncodedUrl,
	isRasterExtension
} from '../helpers';

class BlobServiceAccountManager {
	private azAccount: string;
	private azAccountKey: string;
	private blobServiceClient: BlobServiceClient;
	private sasToken: string;
	private baseUrl: string;
	private titilerUrl: string;

	constructor(azAccount: string, azAccountKey: string, titilerUrl: string) {
		this.azAccount = azAccount;
		this.azAccountKey = azAccountKey;

		this.baseUrl = `https://${this.azAccount}.blob.core.windows.net`;
		this.titilerUrl = titilerUrl;

		const sharedKeyCredential = new StorageSharedKeyCredential(this.azAccount, this.azAccountKey);
		this.blobServiceClient = new BlobServiceClient(this.baseUrl, sharedKeyCredential);
		this.sasToken = generateSasToken(this.blobServiceClient);
	}

	public async listContainers(containerName?: string) {
		const options: ServiceListContainersOptions = {
			includeDeleted: false,
			includeMetadata: true,
			includeSystem: true
		};
		if (containerName) {
			options.prefix = containerName;
		}

		const storages: Storage[] = [];

		for await (const containerItem of this.blobServiceClient.listContainers(options)) {
			const metadata: ContainerMetadata = containerItem.metadata as unknown as ContainerMetadata;
			if (metadata.published !== 'true') continue;
			const tagValues: string[] = metadata.tags.split(',');
			const tags: Tag[] = tagValues.map((tag) => {
				const t: Tag = { key: 'keyword', value: tag.trim() };
				return t;
			});
			if (metadata.sdg) {
				tags.push({
					key: 'sdg',
					value: metadata.sdg
				});
			}
			const url = `${this.baseUrl}/${containerItem.name}`;
			const storage: Storage = {
				id: generateHashKey(url),
				name: containerItem.name,
				url: url,
				label: metadata.label,
				description: metadata.description,
				icon: metadata.icon,
				tags: tags.filter((t) => t.value.length > 0)
			};
			storages.push(storage);
		}
		return storages;
	}

	public async scanContainers(storages: Storage[]): Promise<Dataset[]> {
		const datasets: Dataset[] = [];
		for (const storage of storages) {
			const results = await this.scanContainer(storage);
			Array.prototype.push.apply(datasets, results);
		}
		return datasets;
	}

	public async scanContainer(storage: Storage) {
		console.debug(`${storage.name} started scanning`);
		const containerClient = this.blobServiceClient.getContainerClient(storage.name);
		const datasets = await this.listBlobs(containerClient, storage);
		console.debug(`${storage.name} ended scanning ${datasets.length} datasets`);
		return datasets;
	}

	public async scanBlob(url: string) {
		console.debug(`${url} started scanning`);

		const blobUrl = new URL(url);
		const paths = blobUrl.pathname.split('/');
		const containerName = paths[1];
		const blobName = paths.slice(2).join('/');
		console.log(containerName);
		console.log(blobName);

		const storages = await this.listContainers(containerName);

		const containerClient = this.blobServiceClient.getContainerClient(containerName);
		const bclient = containerClient.getBlobClient(blobName);
		const existsBlob = await bclient.exists();

		let dataset: Dataset | undefined = undefined;
		if (existsBlob) {
			dataset = await this.createDataset(containerClient, storages[0], blobName);
		}

		console.debug(`${url} ended scanning`);

		return {
			storage: storages[0],
			dataset: dataset
		};
	}

	public async listBlobs(containerClient: ContainerClient, storage: Storage, path?: string) {
		let datasets: Dataset[] = [];
		for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: path })) {
			if (item.kind === 'prefix') {
				// folder
				const metadataJsonFileName = `${item.name}metadata.json`;
				const bclient = containerClient.getBlobClient(metadataJsonFileName);
				const isVectorTile: boolean = await bclient.exists();
				if (isVectorTile) {
					const dataset = await this.createDataset(containerClient, storage, metadataJsonFileName);
					if (!dataset) continue;
					datasets.push(dataset);
				} else {
					const dataset = await this.listBlobs(containerClient, storage, item.name);
					if (dataset.length === 0) continue;
					datasets = [...datasets, ...dataset];
				}
			} else {
				// blob
				const dataset = await this.createDataset(containerClient, storage, item.name);
				if (!dataset) continue;
				datasets.push(dataset);
			}
		}
		return datasets;
	}

	private async createDataset(
		containerClient: ContainerClient,
		storage: Storage,
		itemName: string
	) {
		const isStaticMVT = itemName.indexOf('metadata.json') !== -1;
		const isPmtiles = itemName.indexOf('.pmtiles') !== -1;
		let isRaster = false;
		if (isStaticMVT === false && isPmtiles === false) {
			// raster
			if (isRasterExtension(itemName)) {
				isRaster = true;
			} else {
				return;
			}
		}

		const blockBlobClient = containerClient.getBlockBlobClient(itemName);
		const result = await blockBlobClient.getTags();
		const tags: Tag[] = [];
		for (const tag in result.tags) {
			// skip name tag to register
			if (['name1', 'name2', 'name3'].includes(tag.toLowerCase())) continue;
			if (result.tags[tag] && result.tags[tag] === 'nan') continue;
			if (tag === 'sdg_goal') {
				try {
					const value = parseInt(result.tags[tag]);
					tags.push({
						key: tag,
						value: value.toString()
					});
				} catch {
					const values = result.tags[tag].split(' ');
					values.forEach((value) => {
						tags.push({
							key: tag,
							value: value
						});
					});
					console.log(JSON.stringify(tags));
				}
			} else {
				tags.push({
					key: tag,
					value: result.tags[tag]
				});
			}
		}

		const url = blockBlobClient.url;
		const properties = await blockBlobClient.getProperties();
		const metadata = isRaster
			? await this.getRasterMetadata(url)
			: await this.getVectorMetadata(url);
		if (!metadata) throw new Error('cannot fetch metadata.');
		const urlObj = new URL(url).pathname.replace('/metadata.json', '').split('/');

		let dataUrl = url;
		if (isStaticMVT) {
			dataUrl = url.replace('/metadata.json', '/{z}/{x}/{y}.pbf');
		} else if (isPmtiles) {
			dataUrl = `pmtiles://${url}`;
		}

		const dataset: Dataset = {
			id: generateHashKey(url),
			url: dataUrl,
			name: cleanName(urlObj.pop()),
			is_raster: isRaster,
			description: metadata.description,
			bounds: metadata.bounds,
			source: metadata.source,
			storage: storage,
			tags: tags,
			createdat: properties.createdOn ? properties.createdOn.toISOString() : '',
			updatedat: properties.lastModified ? properties.lastModified.toISOString() : ''
		};
		return dataset;
	}

	private async getRasterMetadata(url: string) {
		const fileUrl = `${url}${this.sasToken}`;
		const apiUrl = `${this.titilerUrl}/cog/info?url=${getBase64EncodedUrl(fileUrl)}`;
		const res = await fetch(apiUrl);
		const json: RasterTileMetadata = await res.json();
		const band_metadata = json.band_metadata;
		let description: string | undefined;
		let source: string | undefined;
		band_metadata?.forEach((band) => {
			band.forEach((data: string | BandMetadata) => {
				if (data instanceof String) return;
				const metadata = data as BandMetadata;
				description = metadata.Description;
				source = metadata.Source;
			});
		});

		return {
			bounds: (json.bounds ? json.bounds : [-180, -90, 180, 90]) as [
				number,
				number,
				number,
				number
			],
			description: description,
			source: source
		};
	}

	private async getVectorMetadata(url: string) {
		const isPmtiles = url.indexOf('.pmtiles') !== -1;
		if (isPmtiles) {
			const p = new pmtiles.PMTiles(`${url}${this.sasToken}`);
			const metadata = await p.getMetadata();
			const header = await p.getHeader();
			const bounds: [number, number, number, number] = [
				header.minLon,
				header.minLat,
				header.maxLon,
				header.maxLat
			];
			const description: string | undefined = metadata.description;
			const source: string | undefined = metadata.attribution;
			return {
				bounds: bounds,
				description,
				source
			};
		} else {
			const apiUrl = `${url}${this.sasToken}`;
			const res = await fetch(apiUrl);
			const metadata = await res.json();
			const bounds: string = metadata.bounds;
			const description: string | undefined = metadata.description;
			const source: string | undefined = metadata.attribution;
			return {
				bounds: (bounds ? bounds.split(',').map((b) => Number(b)) : [-180, -90, 180, 90]) as [
					number,
					number,
					number,
					number
				],
				description,
				source
			};
		}
	}
}

export default BlobServiceAccountManager;
