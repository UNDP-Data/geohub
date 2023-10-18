import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { env } from '$env/dynamic/private';

export const updateMosaicJsonBlob = async (url: string, content: string) => {
	const urlObj = new URL(url);

	const sharedKeyCredential = new StorageSharedKeyCredential(
		env.AZURE_STORAGE_ACCOUNT,
		env.AZURE_STORAGE_ACCESS_KEY
	);

	// create storage container
	const blobServiceClient = new BlobServiceClient(urlObj.origin, sharedKeyCredential);

	const pathnames = urlObj.pathname.split('/');
	const containerName = pathnames[1];
	const containerClient = blobServiceClient.getContainerClient(containerName);

	const blobName = pathnames.splice(2).join('/');
	const blockBlobClient = containerClient.getBlockBlobClient(blobName);

	const contentBuffer = Buffer.from(content, 'utf-8');
	await blockBlobClient.uploadData(contentBuffer);
};
