import {
	AccountSASPermissions,
	BlobServiceClient,
	StorageSharedKeyCredential
} from '@azure/storage-blob';
import { env } from '$env/dynamic/private';
import { TokenExpiryPeriodMsec } from '$lib/config/AppConfig';
import { isGeoHubBlobStorage } from './isGeoHubBlobStorage';

export const generateAzureBlobSasToken = async (
	url: string,
	expiry_period: number = TokenExpiryPeriodMsec,
	permission = 'r'
) => {
	const isGeoHubStorage = isGeoHubBlobStorage(url);
	if (!isGeoHubStorage) return '';

	const account =
		url.indexOf(env.AZURE_STORAGE_ACCOUNT) !== -1
			? env.AZURE_STORAGE_ACCOUNT
			: env.AZURE_STORAGE_ACCOUNT_UPLOAD;
	const accessKey =
		url.indexOf(env.AZURE_STORAGE_ACCOUNT) !== -1
			? env.AZURE_STORAGE_ACCESS_KEY
			: env.AZURE_STORAGE_ACCESS_KEY_UPLOAD;

	if (!(account && accessKey)) {
		return '';
	}

	const sharedKeyCredential = new StorageSharedKeyCredential(account, accessKey);
	// create storage container
	const blobServiceClient = new BlobServiceClient(
		`https://${account}.blob.core.windows.net`,
		sharedKeyCredential
	);

	const blobUrl = new URL(url);
	const paths = blobUrl.pathname.split('/');
	const containerName = paths.length > 1 ? paths[1] : '';
	if (containerName) {
		const blobContainerClient = blobServiceClient.getContainerClient(containerName);
		const accessPolicy = await blobContainerClient.getAccessPolicy();
		// https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/models.containergetpropertiesheaders?view=azure-node-legacy#@azure-storage-blob-models-containergetpropertiesheaders-blobpublicaccess
		if (accessPolicy.blobPublicAccess === 'container') {
			// if container has a public access, skip generating SAS token
			return '';
		}
	}

	// generate account SAS token for vector tiles. This is needed because the
	// blob level SAS tokens have the blob name encoded inside the SAS token and the
	// adding a vector tile to mapbox requires adding a template/pattern not one file and reading many more files as well.

	const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(
		new Date(new Date().valueOf() + expiry_period),
		AccountSASPermissions.parse(permission),
		'o'
	);
	const ACCOUNT_SAS_TOKEN_URL = new URL(ACCOUNT_SAS_TOKEN_URI);
	return ACCOUNT_SAS_TOKEN_URL.search;
};
