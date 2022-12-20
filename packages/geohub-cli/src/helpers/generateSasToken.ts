import { AccountSASPermissions } from '@azure/storage-blob';
import { BlobServiceClient } from '@azure/storage-blob';

export const generateSasToken = (blobServiceClient: BlobServiceClient) => {
	const expiredOn = 86400000; // 1 day
	const ACCOUNT_SAS_TOKEN_URI = blobServiceClient.generateAccountSasUrl(
		new Date(new Date().valueOf() + expiredOn),
		AccountSASPermissions.parse('r'),
		'o'
	);
	return new URL(ACCOUNT_SAS_TOKEN_URI).search;
};
