import { AccountSASPermissions, type ServiceListContainersOptions } from '@azure/storage-blob';
import {
	createDatasetLinks,
	generateHashKey,
	getBlobServiceClient,
	UPLOAD_BASE_URL,
	UPLOAD_CONTAINER_NAME,
	UPLOAD_DATASETS_FOLDER_NAME,
	UPLOAD_RAW_FOLDER_NAME
} from '$lib/server/helpers';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import type { IngestedDataset, IngestingDataset } from '$lib/types';
import { isRasterExtension } from '$lib/helper';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!env.AZURE_STORAGE_ACCOUNT_UPLOAD || !env.AZURE_STORAGE_ACCESS_KEY_UPLOAD) {
		return new Response(JSON.stringify({ message: 'Azure Storage credentials not found' }), {
			status: 403
		});
	}
	const session = await locals.getSession();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}
	const user_email = session?.user.email;
	const userHash = generateHashKey(user_email);

	const azureBaseUrl = UPLOAD_BASE_URL(env.AZURE_STORAGE_ACCOUNT_UPLOAD);
	const blobServiceClient = getBlobServiceClient(
		env.AZURE_STORAGE_ACCOUNT_UPLOAD,
		env.AZURE_STORAGE_ACCESS_KEY_UPLOAD
	);

	const options: ServiceListContainersOptions = {
		includeDeleted: false,
		includeMetadata: false,
		includeSystem: true
	};
	options.prefix = `${UPLOAD_CONTAINER_NAME}`;

	// generate SAS token
	const expiry_period = 3600000; // 1 hour
	const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(
		new Date(new Date().valueOf() + expiry_period),
		AccountSASPermissions.parse('rwd'),
		'o'
	);
	const ACCOUNT_SAS_TOKEN_URL = new URL(ACCOUNT_SAS_TOKEN_URI).search;

	const datasets: IngestingDataset[] = [];

	// scan userdata/{useremail hash}/raw folder
	const containerClient = blobServiceClient.getContainerClient(UPLOAD_CONTAINER_NAME);
	const rawPath = `${userHash}/${UPLOAD_RAW_FOLDER_NAME}`;
	for await (const folder of containerClient.listBlobsByHierarchy('/', { prefix: rawPath })) {
		if (folder.kind !== 'prefix') return;
		// folder
		const errorFiles: { [key: string]: string } = {};
		for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: folder.name })) {
			const file_name = item.name.replace(folder.name, '');
			if (file_name.indexOf('.error') !== -1) {
				errorFiles[
					file_name.replace('.error', '')
				] = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}${ACCOUNT_SAS_TOKEN_URL}`;
				continue;
			}
			const blockBlobClient = containerClient.getBlockBlobClient(item.name);
			const properties = await blockBlobClient.getProperties();
			const _url = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}`;
			const id = generateHashKey(_url);
			const dataset: IngestingDataset = {
				raw: {
					id: id,
					name: file_name,
					url: `${_url}${ACCOUNT_SAS_TOKEN_URL}`,
					contentLength: properties.contentLength,
					createdat: properties.createdOn.toISOString(),
					updatedat: properties.lastModified.toISOString()
				}
			};
			datasets.push(dataset);
		}
		Object.keys(errorFiles)?.forEach((file) => {
			const dataset = datasets.find((ds) => ds.raw.name === file);
			if (!dataset) return;
			dataset.raw.error = errorFiles[file];
		});
	}

	// scan userdata/{useremail hash}/datasets folder
	const datasetPath = `${userHash}/${UPLOAD_DATASETS_FOLDER_NAME}`;
	for (const dataset of datasets) {
		const rawName = dataset.raw.name;
		for await (const folder of containerClient.listBlobsByHierarchy('/', {
			prefix: `${datasetPath}/${rawName}`
		})) {
			if (folder.kind !== 'prefix') return;
			const ingesting: IngestedDataset = {};
			for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: folder.name })) {
				const blockBlobClient = containerClient.getBlockBlobClient(item.name);
				const properties = await blockBlobClient.getProperties();
				const names = item.name.split('/');
				const file_name = names[names.length - 1];

				if (file_name.indexOf('.ingesting') === -1) {
					const _url = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}`;
					ingesting.id = generateHashKey(_url);
					ingesting.name = file_name;
					ingesting.url = `${_url}${ACCOUNT_SAS_TOKEN_URL}`;
					ingesting.contentLength = properties.contentLength;
					ingesting.createdat = properties.createdOn.toISOString();
					ingesting.updatedat = properties.lastModified.toISOString();
					ingesting.processing = false;
					ingesting.feature = {
						type: 'Feature',
						properties: {
							id: ingesting.id,
							url: _url.indexOf('pmtiles') > 0 ? `pmtiles://${ingesting.url}` : ingesting.url,
							is_raster: isRasterExtension(ingesting.url.split('?')[0])
						}
					};
					ingesting.feature.properties = createDatasetLinks(
						ingesting.feature,
						url.origin,
						env.TITILER_ENDPOINT
					);
				} else {
					ingesting.processing = true;
					ingesting.processingFile = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}${ACCOUNT_SAS_TOKEN_URL}`;
				}
			}
			if (!dataset.datasets) {
				dataset.datasets = [];
			}
			dataset.datasets.push(ingesting);
		}
	}
	return new Response(JSON.stringify(datasets));
};
