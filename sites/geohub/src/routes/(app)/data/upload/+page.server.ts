import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { BlobSASPermissions, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { env } from '$env/dynamic/private';
import {
	getBlobServiceClient,
	sendMessageToServiceBusQueue,
	UPLOAD_BLOB_URL,
	UPLOAD_CONTAINER_NAME,
	UPLOAD_RAW_FOLDER_NAME
} from '$lib/server/helpers';
const queueName = env.AZURE_SERVICE_BUS_QUEUE_NAME;

export const actions = {
	/**
	 * An action to get SAS URL for data uploading
	 */
	getSasUrl: async ({ request, locals }) => {
		try {
			const session = await locals.getSession();
			if (!session) return {};
			const userHash = session?.user.id;
			const fileName = (await request.formData()).get('fileName') as string;
			const now = new Date().toISOString().replace(/(\.\d{3})|[^\d]/g, '');
			const names = fileName.split('.') as [string, string];
			const newFileName = `${names[0]}_${now}.${names[1]}`;
			const folder = `${userHash}/${UPLOAD_RAW_FOLDER_NAME}`;
			const sasUrl = await getSasUrl(folder, UPLOAD_CONTAINER_NAME, newFileName);
			const blobUrl = UPLOAD_BLOB_URL(env.AZURE_STORAGE_ACCOUNT_UPLOAD, userHash, newFileName);
			return { sasUrl, blobUrl };
		} catch (error) {
			return fail(500, { status: error.status, message: 'error:' + error.message });
		}
	},
	completingUpload: async ({ request, locals }) => {
		try {
			const session = await locals.getSession();
			if (!session) return {};
			const token = session.accessToken;
			const data = await request.formData();
			const blobUrl = data.get('blobUrl') as string;
			const join_vectortiles = data.get('join_vectortiles') as string;

			// message format is defined in the below URL
			// https://github.com/UNDP-Data/geohub/discussions/545#discussioncomment-7121294
			const message = `${blobUrl};${token};join_vectortiles=${join_vectortiles}`;
			await sendMessageToServiceBusQueue(queueName, message);
			return JSON.stringify({ blobUrl });
		} catch (error) {
			return fail(500, { status: error.status, message: 'error:' + error.message });
		}
	}
} satisfies Actions;

async function getSasUrl(userId: string, containerName: string, fileName: string) {
	if (!env.AZURE_STORAGE_ACCOUNT_UPLOAD || !env.AZURE_STORAGE_ACCESS_KEY_UPLOAD) {
		throw Error('Azure Storage credentials not found');
	}

	const containerClient = getContainerClient(containerName);

	// save file in user email folder
	const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(
		userId + '/' + fileName
	);

	return blockBlobClient.generateSasUrl({
		// allow user to write
		permissions: BlobSASPermissions.from({
			write: true
		}),

		// expired in an hour
		expiresOn: new Date(new Date().setHours(new Date().getHours() + 1))
	});
}

function getContainerClient(containerName: string) {
	const blobServiceClient = getBlobServiceClient(
		env.AZURE_STORAGE_ACCOUNT_UPLOAD,
		env.AZURE_STORAGE_ACCESS_KEY_UPLOAD
	);
	const containerClient: ContainerClient = blobServiceClient.getContainerClient(containerName);
	return containerClient;
}
