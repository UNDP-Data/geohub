export const UPLOAD_CONTAINER_NAME = 'userdata';
export const UPLOAD_RAW_FOLDER_NAME = 'raw';
export const UPLOAD_DATASETS_FOLDER_NAME = 'datasets';

export const UPLOAD_BASE_URL = (account: string) => {
	return `https://${account}.blob.core.windows.net`;
};

export const UPLOAD_BLOB_URL = (account: string, userHash: string, fileName: string) => {
	const folder = `${userHash}/${UPLOAD_RAW_FOLDER_NAME}`;
	return `${UPLOAD_BASE_URL(account)}/${UPLOAD_CONTAINER_NAME}/${folder}/${fileName}`;
};
