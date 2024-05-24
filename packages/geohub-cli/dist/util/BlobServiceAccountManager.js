"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_blob_1 = require("@azure/storage-blob");
const pmtiles_1 = require("pmtiles");
const helpers_1 = require("../helpers");
class BlobServiceAccountManager {
    azAccount;
    azAccountKey;
    blobServiceClient;
    sasToken;
    baseUrl;
    titilerUrl;
    constructor(azAccount, azAccountKey, titilerUrl) {
        this.azAccount = azAccount;
        this.azAccountKey = azAccountKey;
        this.baseUrl = `https://${this.azAccount}.blob.core.windows.net`;
        this.titilerUrl = titilerUrl;
        const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(this.azAccount, this.azAccountKey);
        this.blobServiceClient = new storage_blob_1.BlobServiceClient(this.baseUrl, sharedKeyCredential);
        this.sasToken = (0, helpers_1.generateSasToken)(this.blobServiceClient);
    }
    async listContainers(containerName) {
        const options = {
            includeDeleted: false,
            includeMetadata: true,
            includeSystem: true
        };
        if (containerName) {
            options.prefix = containerName;
        }
        const storages = [];
        for await (const containerItem of this.blobServiceClient.listContainers(options)) {
            const metadata = containerItem.metadata;
            if (metadata.published !== 'true')
                continue;
            const url = `${this.baseUrl}/${containerItem.name}`;
            const storage = {
                name: containerItem.name,
                url: url
            };
            storages.push(storage);
        }
        return storages;
    }
    async scanContainers(storages) {
        const datasets = [];
        for (const storage of storages) {
            const results = await this.scanContainer(storage);
            Array.prototype.push.apply(datasets, results);
        }
        return datasets;
    }
    async scanContainer(storage) {
        console.debug(`${storage.name} started scanning`);
        const containerClient = this.blobServiceClient.getContainerClient(storage.name);
        const datasets = await this.listBlobs(containerClient);
        console.debug(`${storage.name} ended scanning ${datasets.length} datasets`);
        return datasets;
    }
    async scanBlob(url) {
        console.debug(`${url} started scanning`);
        const blobUrl = new URL(url);
        const paths = blobUrl.pathname.split('/');
        const containerName = paths[1];
        const blobName = paths.slice(2).join('/');
        console.log(containerName);
        console.log(blobName);
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const bclient = containerClient.getBlobClient(blobName);
        const existsBlob = await bclient.exists();
        let dataset = undefined;
        if (existsBlob) {
            dataset = await this.createDataset(containerClient, blobName);
        }
        console.debug(`${url} ended scanning`);
        return {
            dataset: dataset
        };
    }
    async listBlobs(containerClient, path) {
        let datasets = [];
        for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: path })) {
            if (item.kind === 'prefix') {
                // folder
                const metadataJsonFileName = `${item.name}metadata.json`;
                const bclient = containerClient.getBlobClient(metadataJsonFileName);
                const isVectorTile = await bclient.exists();
                if (isVectorTile) {
                    const dataset = await this.createDataset(containerClient, metadataJsonFileName);
                    if (!dataset)
                        continue;
                    datasets.push(dataset);
                }
                else {
                    const dataset = await this.listBlobs(containerClient, item.name);
                    if (dataset.length === 0)
                        continue;
                    datasets = [...datasets, ...dataset];
                }
            }
            else {
                // blob
                const dataset = await this.createDataset(containerClient, item.name);
                if (!dataset)
                    continue;
                datasets.push(dataset);
            }
        }
        return datasets;
    }
    async createDataset(containerClient, itemName) {
        const isStaticMVT = itemName.indexOf('metadata.json') !== -1;
        const isPmtiles = itemName.indexOf('.pmtiles') !== -1;
        let isRaster = false;
        if (isStaticMVT === false && isPmtiles === false) {
            // raster
            if ((0, helpers_1.isRasterExtension)(itemName)) {
                isRaster = true;
            }
            else {
                return;
            }
        }
        const blockBlobClient = containerClient.getBlockBlobClient(itemName);
        const result = await blockBlobClient.getTags();
        const tags = [];
        for (const tag in result.tags) {
            // skip name tag to register
            if (['name1', 'name2', 'name3'].includes(tag.toLowerCase()))
                continue;
            if (result.tags[tag] && result.tags[tag] === 'nan')
                continue;
            if (tag === 'sdg_goal') {
                try {
                    const value = parseInt(result.tags[tag]);
                    tags.push({
                        key: tag,
                        value: value.toString()
                    });
                }
                catch {
                    const values = result.tags[tag].split(' ');
                    values.forEach((value) => {
                        tags.push({
                            key: tag,
                            value: value
                        });
                    });
                    console.log(JSON.stringify(tags));
                }
            }
            else {
                tags.push({
                    key: tag,
                    value: result.tags[tag]
                });
            }
        }
        tags.push({
            key: 'type',
            value: 'azure'
        });
        tags.push({
            key: 'container',
            value: containerClient.containerName
        });
        const url = blockBlobClient.url;
        const properties = await blockBlobClient.getProperties();
        const metadata = isRaster
            ? await this.getRasterMetadata(url)
            : await this.getVectorMetadata(url);
        if (!metadata)
            throw new Error('cannot fetch metadata.');
        let dataUrl = url;
        if (isStaticMVT) {
            dataUrl = url.replace('/metadata.json', '/{z}/{x}/{y}.pbf');
        }
        else if (isPmtiles) {
            dataUrl = `pmtiles://${url}`;
        }
        if (metadata.source) {
            const providers = metadata.source.split(',');
            providers.forEach((name) => {
                let value = name.replace(/"/g, '').replace('_x000D_', '');
                if (value === 'UNDP') {
                    value = 'United Nations Development Programme (UNDP)';
                }
                else if (value === 'UNICEF') {
                    value = `United Nations Children's Fund (UNICEF)`;
                }
                value = value.trim();
                value.split('\n').forEach((v) => {
                    v = v.trim();
                    tags.push({
                        key: 'provider',
                        value: v
                    });
                });
            });
        }
        const dataset = {
            id: (0, helpers_1.generateHashKey)(url),
            url: dataUrl,
            name: metadata.name,
            is_raster: isRaster,
            description: metadata.description,
            bounds: metadata.bounds,
            tags: tags,
            createdat: properties.createdOn ? properties.createdOn.toISOString() : '',
            updatedat: properties.lastModified ? properties.lastModified.toISOString() : ''
        };
        return dataset;
    }
    async getRasterMetadata(url) {
        const fileUrl = `${url}${this.sasToken}`;
        const apiUrl = `${this.titilerUrl}/cog/info?url=${(0, helpers_1.getBase64EncodedUrl)(fileUrl)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();
        const band_metadata = json.band_metadata;
        const urlObj = new URL(url).pathname.split('/');
        const name = (0, helpers_1.cleanName)(urlObj.pop());
        let description;
        let source;
        band_metadata?.forEach((band) => {
            band.forEach((data) => {
                if (data instanceof String)
                    return;
                const metadata = data;
                description = metadata.Description;
                source = metadata.Source;
            });
        });
        return {
            name,
            bounds: (json.bounds ? json.bounds : [-180, -90, 180, 90]),
            description: description,
            source: source
        };
    }
    async getVectorMetadata(url) {
        const isPmtiles = url.indexOf('.pmtiles') !== -1;
        const urlObj = new URL(url).pathname.replace('/metadata.json', '').split('/');
        if (isPmtiles) {
            const p = new pmtiles_1.PMTiles(`${url}${this.sasToken}`);
            const metadata = (await p.getMetadata());
            const header = await p.getHeader();
            const bounds = [
                header.minLon,
                header.minLat,
                header.maxLon,
                header.maxLat
            ];
            const name = metadata.name ?? (0, helpers_1.cleanName)(urlObj.pop());
            const description = metadata.description;
            const source = metadata.attribution;
            return {
                name: name,
                bounds: bounds,
                description,
                source
            };
        }
        else {
            const apiUrl = `${url}${this.sasToken}`;
            const res = await fetch(apiUrl);
            const metadata = await res.json();
            const name = metadata.name ?? (0, helpers_1.cleanName)(urlObj.pop());
            const bounds = metadata.bounds;
            const description = metadata.description;
            const source = metadata.attribution;
            return {
                name,
                bounds: (bounds ? bounds.split(',').map((b) => Number(b)) : [-180, -90, 180, 90]),
                description,
                source
            };
        }
    }
}
exports.default = BlobServiceAccountManager;
