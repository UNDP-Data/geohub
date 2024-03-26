import { AccountSASPermissions, type ServiceListContainersOptions } from '@azure/storage-blob';
import {
	createDatasetLinks,
	getBlobServiceClient,
	UPLOAD_BASE_URL,
	UPLOAD_CONTAINER_NAME,
	UPLOAD_DATASETS_FOLDER_NAME,
	UPLOAD_RAW_FOLDER_NAME
} from '$lib/server/helpers';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import type { IngestedDataset, IngestingDataset } from '$lib/types';
import { generateHashKey, isRasterExtension } from '$lib/helper';
import { AccessLevel, IngestingDatasetSortingColumns } from '$lib/config/AppConfig';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!env.AZURE_STORAGE_ACCOUNT_UPLOAD || !env.AZURE_STORAGE_ACCESS_KEY_UPLOAD) {
		return new Response(JSON.stringify({ message: 'Azure Storage credentials not found' }), {
			status: 403
		});
	}
	const session = await locals.auth();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}
	const userHash = session.user.id;

	const sortby = url.searchParams.get('sortby') ?? 'createdat';

	if (!IngestingDatasetSortingColumns.find((col) => col.value === sortby)) {
		return new Response(
			JSON.stringify({
				message: `Invalid sortby value. It must be one of the following values: ${IngestingDatasetSortingColumns.map(
					(c) => c.value
				).join(', ')}`
			}),
			{
				status: 400
			}
		);
	}

	const sortorder = url.searchParams.get('sortorder') ?? 'desc';
	if (!['asc', 'desc'].includes(sortorder)) {
		return new Response(
			JSON.stringify({
				message: `Invalid sortorder value. It must be one of the following values: asc, desc`
			}),
			{
				status: 400
			}
		);
	}

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

	let datasets: IngestingDataset[] = [];

	// scan userdata/{useremail hash}/raw folder
	const containerClient = blobServiceClient.getContainerClient(UPLOAD_CONTAINER_NAME);
	const rawPath = `${userHash}/${UPLOAD_RAW_FOLDER_NAME}`;
	for await (const folder of containerClient.listBlobsByHierarchy('/', { prefix: rawPath })) {
		if (folder.kind !== 'prefix') return;
		// folder
		const errorFiles: { [key: string]: string } = {};
		const logFiles: { [key: string]: string } = {};
		for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: folder.name })) {
			const file_name = item.name.replace(folder.name, '');
			if (file_name.indexOf('.error') !== -1) {
				errorFiles[file_name.replace('.error', '')] =
					`${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}${ACCOUNT_SAS_TOKEN_URL}`;
				continue;
			}
			if (file_name.indexOf('.log') !== -1) {
				logFiles[file_name.replace('.log', '')] =
					`${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}${ACCOUNT_SAS_TOKEN_URL}`;
				continue;
			}
			const blockBlobClient = containerClient.getBlockBlobClient(item.name);
			const properties = await blockBlobClient.getProperties();
			const metadata = properties.metadata;
			const _url = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}`;
			const id = generateHashKey(_url);
			const dataset: IngestingDataset = {
				raw: {
					id: id,
					name: file_name,
					url: `${_url}${ACCOUNT_SAS_TOKEN_URL}`,
					contentLength: properties.contentLength,
					createdat: properties.createdOn.toISOString(),
					updatedat: properties.lastModified.toISOString(),
					stage: metadata.stage ?? 'Preparing',
					progress: metadata.progress ? parseInt(metadata.progress) : 0
				}
			};
			datasets.push(dataset);
		}
		Object.keys(errorFiles)?.forEach((file) => {
			const dataset = datasets.find((ds) => ds.raw.name === file);
			if (!dataset) return;
			dataset.raw.error = errorFiles[file];
		});
		Object.keys(logFiles)?.forEach((file) => {
			const dataset = datasets.find((ds) => ds.raw.name === file);
			if (!dataset) return;
			dataset.raw.log = logFiles[file];
		});
	}

	// scan userdata/{useremail hash}/datasets folder
	const datasetPath = `${userHash}/${UPLOAD_DATASETS_FOLDER_NAME}`;
	for (const dataset of datasets) {
		const rawName = dataset.raw.name;
		dataset.datasets = [];
		for await (const folder of containerClient.listBlobsByHierarchy('/', {
			prefix: `${datasetPath}/${rawName}`
		})) {
			if (folder.kind !== 'prefix') return;
			for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: folder.name })) {
				const blockBlobClient = containerClient.getBlockBlobClient(item.name);
				const properties = await blockBlobClient.getProperties();
				const names = item.name.split('/');
				const file_name = names[names.length - 1];

				if (file_name.indexOf('.ingesting') === -1) {
					const ingesting: IngestedDataset = {};
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
							is_raster: isRasterExtension(ingesting.url.split('?')[0]),
							access_level: AccessLevel.PRIVATE
						}
					};
					ingesting.feature.properties = await createDatasetLinks(
						ingesting.feature,
						url.origin,
						env.TITILER_ENDPOINT
					);

					dataset.datasets.push(ingesting);
				}
			}

			for await (const item of containerClient.listBlobsByHierarchy('/', { prefix: folder.name })) {
				const names = item.name.split('/');
				const file_name = names[names.length - 1];
				if (file_name.indexOf('.ingesting') > -1) {
					const _url = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name.replace(
						'.ingesting',
						''
					)}`;
					const id = generateHashKey(_url);
					const ingesting = dataset.datasets.find((ds) => ds.id === id);
					if (ingesting) {
						ingesting.processing = true;
						ingesting.processingFile = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}${ACCOUNT_SAS_TOKEN_URL}`;
					}
				}
			}
		}
	}

	datasets.forEach((dataset) => {
		if (dataset.datasets.length === 0) {
			return;
		}
		let allDatasetsProcessed = true;
		dataset.datasets.forEach((data) => {
			if (data.processing === true) {
				allDatasetsProcessed = false;
			}
		});
		if (allDatasetsProcessed) {
			dataset.raw.stage = 'Processed';
			dataset.raw.progress = 100;
		}
	});

	datasets = datasets.sort((a, b) => {
		if (a.raw[sortby] > b.raw[sortby]) {
			return sortorder === 'desc' ? -1 : 1;
		} else if (a.raw[sortby] < b.raw[sortby]) {
			return sortorder === 'desc' ? 1 : -1;
		} else {
			return 0;
		}
	});

	return new Response(JSON.stringify(datasets));
};
