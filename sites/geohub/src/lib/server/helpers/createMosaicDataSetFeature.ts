import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { AccessLevel, attribution } from '$lib/config/AppConfig';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { DatasetFeature } from '$lib/types';
import { generateHashKey } from '$lib/helper';

export const createMosaicDataSetFeature = async (features: DatasetFeature[], mosaicUrl: string) => {
	const firstFeature = features[0];

	let bbox: number[] = [];
	features.forEach((f) => {
		const ring = f.geometry.coordinates[0];
		const minx = ring[0][0];
		const miny = ring[0][1];
		const maxx = ring[3][0];
		const maxy = ring[3][1];
		if (bbox.length === 0) {
			bbox = [minx, miny, maxx, maxy];
		} else {
			if (bbox[0] < minx) {
				bbox[0] = minx;
			} else if (bbox[1] < miny) {
				bbox[1] = miny;
			} else if (bbox[2] > maxx) {
				bbox[2] = maxx;
			} else if (bbox[3] > maxy) {
				bbox[3] = maxy;
			}
		}
	});

	const feature: DatasetFeature = {
		type: 'Feature',
		geometry: {
			type: 'Polygon',
			coordinates: [
				[bbox[0], bbox[1]],
				[bbox[0], bbox[3]],
				[bbox[2], bbox[1]],
				[bbox[2], bbox[3]],
				[bbox[0], bbox[1]]
			]
		},
		properties: {
			id: generateHashKey(mosaicUrl),
			name: `${firstFeature.properties.name}`,
			description: firstFeature.properties.description,
			license: firstFeature.properties.license,
			url: mosaicUrl,
			is_raster: true,
			access_level: AccessLevel.PUBLIC,
			tags: firstFeature.properties.tags.filter((t) => t.key !== 'item')
		}
	};
	const stacType = feature.properties.tags.find((t) => t.key === 'stacType');
	stacType.value = 'mosaicjson';

	const items = features.map((f) => f.properties.tags.find((t) => t.key === 'item'));
	feature.properties.tags.push(...items);

	features
		.map((f) => f.properties.url)
		.forEach((url) => {
			feature.properties.tags.push({
				key: 'itemUrl',
				value: url
			});
		});

	return feature;
};

export const createTitilerMosaicJsonEndpoint = async (urls: string[], name: string) => {
	const payload = {
		url: urls,
		minzoom: 0,
		maxzoom: 22,
		attribution: attribution
	};
	const titilerUrl = env.DEV_TITILER_ENDPOINT.replace('cog', 'mosaicjson');
	const res = await fetch(`${titilerUrl}/build`, {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json'
		},
		body: JSON.stringify(JSON.parse(JSON.stringify(payload)))
	}).catch((err) => {
		throw error(500, err);
	});

	const json = await res.json();

	const blobUrl = await storeMosaicJson2Blob(json, name);
	console.log(`mosaicjson was generated at: ${blobUrl}`);
	return blobUrl;
};

export const storeMosaicJson2Blob = async (mosaicjson: JSON, name: string) => {
	const sharedKeyCredential = new StorageSharedKeyCredential(
		env.AZURE_STORAGE_ACCOUNT,
		env.AZURE_STORAGE_ACCESS_KEY
	);

	// create storage container
	const blobServiceClient = new BlobServiceClient(
		`https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
		sharedKeyCredential
	);

	const containerName = 'mosaicjson';

	const containerClient = blobServiceClient.getContainerClient(containerName);

	const blobName = `${name}`;
	const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

	// upload options
	const uploadOptions = {
		tags: {
			// filter: JSON.parse(filter).filter.args[0].args[1],
			createdBy: 'GeoHub API',
			createdOn: new Date().toDateString()
		}
	};

	// upload file to blob storage
	const buffer = Buffer.from(JSON.stringify(mosaicjson));
	await blockBlobClient.uploadData(buffer, uploadOptions);

	return `https://${env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${containerName}/${blobName}`;
};
