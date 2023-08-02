import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { UPLOAD_BASE_URL } from './upload';

export const getBlobServiceClient = (azAccount: string, azAccountKey: string) => {
	const sharedKeyCredential = new StorageSharedKeyCredential(azAccount, azAccountKey);
	const blobServiceClient: BlobServiceClient = new BlobServiceClient(
		UPLOAD_BASE_URL(azAccount),
		sharedKeyCredential
	);
	return blobServiceClient;
};
