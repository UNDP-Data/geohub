"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
class StacManager {
    stacUrl;
    constructor(stacUrl) {
        this.stacUrl = stacUrl;
    }
    async load() {
        const datasets = await this.loadDatasets();
        return {
            datasets: datasets
        };
    }
    async loadStac() {
        const res = await fetch(this.stacUrl);
        const stacCatalog = await res.json();
        return {
            name: stacCatalog.id,
            url: this.stacUrl,
            label: stacCatalog.title,
            description: stacCatalog.description
        };
    }
    async loadDatasets() {
        const stacInfo = await this.loadStac();
        const res = await fetch(`${stacInfo.url}/collections`);
        const stacCollections = await res.json();
        const datasets = [];
        for (let i = 0; i < stacCollections.collections.length; i++) {
            const collection = stacCollections.collections[i];
            const itemLink = collection.links.find((link) => link.rel === 'items');
            if (!itemLink)
                continue;
            const item = await this.getItem(itemLink.href);
            if (!item)
                continue;
            const assets = Object.values(item.assets).filter(
            // it is preferred to use `image/tiff; application=geotiff; profile=cloud-optimized` to check asset type,
            // but we found some of COG from some STAC server, they don't put `profile=cloud-optimized`.
            // So I removed profile from validation.
            (asset) => asset.type?.indexOf('image/tiff; application=geotiff') !== -1);
            if (assets.length === 0)
                continue;
            const now = new Date().toISOString();
            let bounds = [-180, -90, 180, 90];
            if (collection.extent.spatial.bbox.length > 0) {
                bounds = collection.extent.spatial.bbox[0];
            }
            const temporal = collection.extent.temporal.interval[0];
            const dataset = {
                id: (0, helpers_1.generateHashKey)(itemLink.href),
                url: itemLink.href,
                is_raster: true,
                name: collection.title || collection.id,
                description: collection.description,
                license: collection.license,
                bounds: bounds,
                createdat: temporal[0],
                updatedat: temporal[1] ? temporal[1] : now,
                tags: [
                    {
                        key: 'type',
                        value: 'stac'
                    },
                    {
                        key: 'stac',
                        value: stacInfo.name
                    }
                ]
            };
            if (collection.providers) {
                if (collection.providers) {
                    collection.providers.forEach((provider) => {
                        dataset.tags?.push({
                            key: 'provider',
                            value: provider.name.trim()
                        });
                    });
                }
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
    async getItem(itemUrl) {
        const url = `${itemUrl}?limit=1`;
        const res = await fetch(url);
        const fc = await res.json();
        if (fc.features.length === 0)
            return;
        return fc.features[0];
    }
}
exports.default = StacManager;
