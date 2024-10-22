import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { env } from '$env/dynamic/private';
import { isGeoHubBlobStorage } from './isGeoHubBlobStorage';

/**
 * Check whether the blob exists in GeoHub's blob storage account
 * @param url blob URL in Azure blob storage
 * @returns Boolean
 */
export const existsFileInBlobstorage = async (url: string): Promise<boolean> => {
	const isGeoHubStorage = isGeoHubBlobStorage(url);
	if (!isGeoHubStorage) return false;

	const account =
		url.indexOf(env.AZURE_STORAGE_ACCOUNT) !== -1
			? env.AZURE_STORAGE_ACCOUNT
			: env.AZURE_STORAGE_ACCOUNT_UPLOAD;
	const accessKey =
		url.indexOf(env.AZURE_STORAGE_ACCOUNT) !== -1
			? env.AZURE_STORAGE_ACCESS_KEY
			: env.AZURE_STORAGE_ACCESS_KEY_UPLOAD;

	if (!(account && accessKey)) {
		return false;
	}

	const sharedKeyCredential = new StorageSharedKeyCredential(account, accessKey);

	// Create a BlobServiceClient
	const blobServiceClient = new BlobServiceClient(
		`https://${account}.blob.core.windows.net`,
		sharedKeyCredential
	);

	// Parse the blob URL
	const blobUrl = new URL(url);
	const paths = blobUrl.pathname.split('/');
	const containerName = paths.length > 1 ? paths[1] : '';
	const blobName = paths.length > 2 ? paths.slice(2).join('/') : '';

	if (!containerName || !blobName) {
		return false;
	}

	// Get a reference to the BlobClient
	const blobClient = blobServiceClient
		.getContainerClient(containerName)
		.getBlobClient(decodeURI(blobName));

	// Check if the blob exists
	try {
		return await blobClient.exists();
	} catch {
		return false;
	}
};
