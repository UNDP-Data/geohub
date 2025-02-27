import { Endpoint, z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { AccountSASPermissions, type ServiceListContainersOptions } from '@azure/storage-blob';
import {
	createDatasetLinks,
	getBlobServiceClient,
	UPLOAD_BASE_URL,
	UPLOAD_CONTAINER_NAME,
	UPLOAD_DATASETS_FOLDER_NAME,
	UPLOAD_RAW_FOLDER_NAME
} from '$lib/server/helpers';
import { AddSecurictyModifier } from '$api/securityModifier';
import { env } from '$env/dynamic/private';
import type { IngestedDataset, IngestingDataset } from '$lib/types';
import { generateHashKey, isRasterExtension } from '$lib/helper';
import { AccessLevel, IngestingDatasetSortingColumns } from '$lib/config/AppConfig';
import { error } from '@sveltejs/kit';

export const Output = z.custom<IngestingDataset[]>().describe('datasets statistics');

export const Query = z.object({
	sortby: z
		.enum(['name', 'contentLength', 'createdat', 'updatedat'])
		.optional()
		.default('createdat')
		.describe('Sorting column'),
	sortorder: z
		.enum(['asc', 'desc'])
		.optional()
		.default('desc')
		.describe(`Sorting order either 'asc' or 'desc'`)
});

const description = `
This endpoint is going to scan data upload folder for login user to check the status of ingesting datasets.Authentication is required prior to using this API.

URLs will be attached SAS token (1 hour expiry period)

User's upload folder structure will be like this.

- userdata
	- a85516c81c0b78d3e89d3f00099b8b15 (md5 hash key generated from email)
	- raw
		- aaa_yyyymmddhhmmss.tif - original data
		- aaa_yyyymmddhhmmss.tif.error - in case data processing failed. Logs for data processing should be contained in .error file 
	- datasets
		- aaa_yyyymmddhhmmss.tif - subfolder
		- aaa_yyyymmddhhmmss.tif - processed data
		- aaa_yyyymmddhhmmss.tif.ingesting - processing end, but unpublished
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'get status of ingesting datasets';
	c.description = description;
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	400: apiError(400, `Invalid parameters`),
	403: apiError(403, 'Permission error')
};

export default new Endpoint({ Query, Output, Modifier, Error }).handle(
	async (param, { locals, url }): Promise<IngestingDataset[]> => {
		if (!env.AZURE_STORAGE_ACCOUNT_UPLOAD || !env.AZURE_STORAGE_ACCESS_KEY_UPLOAD) {
			error(403, { message: 'Azure Storage credentials not found' });
		}
		const session = await locals.auth();
		if (!session) {
			error(403, { message: 'Permission error' });
		}
		const userHash = session.user.id;

		const sortby = param.sortby ?? 'createdat';

		if (!IngestingDatasetSortingColumns.find((col) => col.value === sortby)) {
			error(400, {
				message: `Invalid sortby value. It must be one of the following values: ${IngestingDatasetSortingColumns.map(
					(c) => c.value
				).join(', ')}`
			});
		}

		const sortorder = param.sortorder ?? 'desc';
		if (!['asc', 'desc'].includes(sortorder)) {
			error(400, {
				message: `Invalid sortorder value. It must be one of the following values: asc, desc`
			});
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
						contentLength: properties.contentLength as number,
						createdat: (properties.createdOn as Date).toISOString(),
						updatedat: (properties.lastModified as Date).toISOString(),
						stage: metadata?.stage ?? 'Preparing',
						progress: metadata?.progress ? parseInt(metadata.progress) : 0
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

				const fgbMap: { [key: string]: string[] } = {};

				for await (const item of containerClient.listBlobsByHierarchy('/', {
					prefix: folder.name
				})) {
					const blockBlobClient = containerClient.getBlockBlobClient(item.name);
					const properties = await blockBlobClient.getProperties();
					const names = item.name.split('/');
					const file_name = names[names.length - 1];

					if (item.name.endsWith('.ingesting')) {
						continue;
					} else if (item.name.endsWith('.fgb')) {
						const pmtilesItemName = item.name.replace(/\.pmtiles(?:\..+)?\.fgb$/, '.pmtiles');
						const pmtilesId = generateHashKey(
							`${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${pmtilesItemName}`
						);

						const fgbUrl = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}${ACCOUNT_SAS_TOKEN_URL}`;
						if (!fgbMap[pmtilesId]) {
							fgbMap[pmtilesId] = [];
						}
						fgbMap[pmtilesId].push(fgbUrl);
						continue;
					}

					const ingesting: IngestedDataset = {};
					const _url = `${azureBaseUrl}/${UPLOAD_CONTAINER_NAME}/${item.name}`;
					ingesting.id = generateHashKey(_url);
					ingesting.name = file_name;
					ingesting.url = `${_url}${ACCOUNT_SAS_TOKEN_URL}`;
					ingesting.contentLength = properties.contentLength;
					ingesting.createdat = (properties.createdOn as Date).toISOString();
					ingesting.updatedat = (properties.lastModified as Date).toISOString();
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

				if (Object.keys(fgbMap).length > 0) {
					Object.keys(fgbMap).forEach((id) => {
						if (fgbMap[id].length === 0) return;
						const ds = dataset.datasets?.find((d) => d.id === id);
						if (!ds) return;
						ds.originalFiles = [...fgbMap[id]];
					});
				}

				for await (const item of containerClient.listBlobsByHierarchy('/', {
					prefix: folder.name
				})) {
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
			if (dataset.datasets?.length === 0) {
				return;
			}
			let allDatasetsProcessed = true;
			dataset.datasets?.forEach((data) => {
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

		return datasets as IngestingDataset[];
	}
);
