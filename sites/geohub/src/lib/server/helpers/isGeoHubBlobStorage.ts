import { env } from '$env/dynamic/private';

export const isGeoHubBlobStorage = (url: string) => {
	const isGeneralStorageAccount = url.indexOf(env.AZURE_STORAGE_ACCOUNT) === -1 ? false : true;
	const isUploadStorageAccount =
		url.indexOf(env.AZURE_STORAGE_ACCOUNT_UPLOAD) === -1 ? false : true;

	return isGeneralStorageAccount || isUploadStorageAccount;
};
