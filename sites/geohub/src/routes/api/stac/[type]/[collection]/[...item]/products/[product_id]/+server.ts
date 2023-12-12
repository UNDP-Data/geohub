import type { RequestHandler } from '@sveltejs/kit';
import type { StacTemplate } from '$lib/stac/StacTemplate';
import { getStacInstance } from '$lib/stac/getStacInstance';
import { createDatasetLinks, getSTACs } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
// import type { DatasetFeature } from '$lib/types';
// import { AccessLevel, attribution } from '$lib/config/AppConfig';
// import { env } from '$env/dynamic/private';
// import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
// import { generateHashKey } from '$lib/helper';

export const GET: RequestHandler = async ({ params, url }) => {
	const product_id = params.product_id;
	const type = params.type;

	const stacs = await getSTACs('api');
	const stac = stacs.find((x) => x.id === type);
	if (!stac) {
		throw error(400, `Only supported the following stac: ${stacs.map((x) => x.id).join(', ')}`);
	}
	const collection = params.collection;
	const items = params.item.split('/');
	const stacInstance = getStacInstance(stac, collection);
	if (items.length === 1) {
		const item = items[0];
		const productFeature = await getProductFeature(stacInstance, product_id, item, url);
		return new Response(JSON.stringify(productFeature));
	} else {
		// const features: DatasetFeature[] = [];
		//
		// const sortedItems = items.sort();
		//
		// for (const item of sortedItems) {
		// 	const productFeature = await getProductFeature(stacInstance, product_id, item, url);
		// 	features.push(productFeature);
		// }
		// const urls: string[] = features.map((f) => f.properties.url);
		// const name = `${type}/${collection}/${sortedItems.join('/')}/mosaicjson.json`;
		// const mosaicjson = await createTitilerMosaicJsonEndpoint(urls, name);
		// const mosaicjsonFeature = await createMosaicProductFeature(features, mosaicjson);
		// mosaicjsonFeature.properties = createDatasetLinks(
		// 	mosaicjsonFeature,
		// 	url.origin,
		// 	'https://titiler.xyz/stac'
		// );
		// return new Response(JSON.stringify(mosaicjsonFeature));
	}
};

const getProductFeature = async (
	instance: StacTemplate,
	product: string,
	item: string,
	url: URL
) => {
	const stacItem = await instance.getStacItem(item);
	await instance.getStacCollection();
	const productFeature = await instance.generateProductFeature(stacItem, product);
	productFeature.properties = createDatasetLinks(
		productFeature,
		url.origin,
		'https://titiler.xyz/stac'
	);
	return productFeature;
};

// const createMosaicProductFeature = async (features: DatasetFeature[], mosaicUrl: string) => {
// 	const firstFeature = features[0];
//
// 	let bbox: number[] = [];
// 	features.forEach((f) => {
// 		const ring = f.geometry.coordinates[0];
// 		const minx = ring[0][0];
// 		const miny = ring[0][1];
// 		const maxx = ring[3][0];
// 		const maxy = ring[3][1];
// 		if (bbox.length === 0) {
// 			bbox = [minx, miny, maxx, maxy];
// 		} else {
// 			if (bbox[0] < minx) {
// 				bbox[0] = minx;
// 			} else if (bbox[1] < miny) {
// 				bbox[1] = miny;
// 			} else if (bbox[2] > maxx) {
// 				bbox[2] = maxx;
// 			} else if (bbox[3] > maxy) {
// 				bbox[3] = maxy;
// 			}
// 		}
// 	});
//
// 	const feature: DatasetFeature = {
// 		type: 'Feature',
// 		geometry: {
// 			type: 'Polygon',
// 			coordinates: [
// 				[bbox[0], bbox[1]],
// 				[bbox[0], bbox[3]],
// 				[bbox[2], bbox[1]],
// 				[bbox[2], bbox[3]],
// 				[bbox[0], bbox[1]]
// 			]
// 		},
// 		properties: {
// 			id: generateHashKey(mosaicUrl),
// 			name: `${firstFeature.properties.name}`,
// 			product: firstFeature.properties.tags?.find((t) => t.key === 'product')?.value,
// 			collection_id: firstFeature.properties.collection_id,
// 			description: firstFeature.properties.description,
// 			license: firstFeature.properties.license,
// 			url: mosaicUrl,
// 			is_raster: true,
// 			access_level: AccessLevel.PUBLIC,
// 			tags: firstFeature.properties.tags.filter((t) => t.key !== 'item')
// 		}
// 	};
// 	const stacType = feature.properties.tags.find((t) => t.key === 'stacType');
// 	stacType.value = 'mosaicjson';
//
// 	const items = features.map((f) => f.properties.tags.find((t) => t.key === 'item'));
// 	feature.properties.tags.push(...items);
//
// 	console.log(feature)
// 	features
// 		.map((f) => f.properties.url)
// 		.forEach((url) => {
// 			feature.properties.tags.push({
// 				key: 'itemUrl',
// 				value: url
// 			});
// 		});
//
// 	return feature;
// };
// const createTitilerMosaicJsonEndpoint = async (urls: string[], name: string) => {
// 	const payload = {
// 		url: urls,
// 		minzoom: 0,
// 		maxzoom: 22,
// 		attribution: attribution
// 	};
// 	const titilerUrl = 'https://titiler.xyz/mosaicjson'
// 	const res = await fetch(`${titilerUrl}/create`, {
// 		method: 'POST',
// 		headers: {
// 			accept: 'application/json',
// 			'content-type': 'application/json'
// 		},
// 		body: JSON.stringify(JSON.parse(JSON.stringify(payload)))
// 	}).catch((err) => {
// 		throw error(500, err);
// 	});
//
// 	const json = await res.json();
//
// 	const blobUrl = await storeMosaicJson2Blob(json, name);
// 	console.log(`mosaicjson was generated at: ${blobUrl}`);
// 	return blobUrl;
// };
//
// const storeMosaicJson2Blob = async (mosaicjson: JSON, name: string) => {
// 	const sharedKeyCredential = new StorageSharedKeyCredential(
// 		env.AZURE_STORAGE_ACCOUNT,
// 		env.AZURE_STORAGE_ACCESS_KEY
// 	);
//
// 	// create storage container
// 	const blobServiceClient = new BlobServiceClient(
// 		`https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
// 		sharedKeyCredential
// 	);
//
// 	const containerName = 'mosaicjson';
//
// 	const containerClient = blobServiceClient.getContainerClient(containerName);
//
// 	const blobName = `${name}`;
// 	const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
//
// 	// upload options
// 	const uploadOptions = {
// 		tags: {
// 			// filter: JSON.parse(filter).filter.args[0].args[1],
// 			createdBy: 'GeoHub API',
// 			createdOn: new Date().toDateString()
// 		}
// 	};
//
// 	// upload file to blob storage
// 	const buffer = Buffer.from(JSON.stringify(mosaicjson));
// 	await blockBlobClient.uploadData(buffer, uploadOptions);
//
// 	return `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${containerName}/${blobName}`;
// };
