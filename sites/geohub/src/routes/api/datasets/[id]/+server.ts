import type { RequestHandler } from './$types';
import {
	createDatasetLinks,
	getBlobServiceClient,
	getDatasetById,
	isSuperuser
} from '$lib/server/helpers';
import DatasetManager from '$lib/server/DatasetManager';
import { env } from '$env/dynamic/private';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { DatasetPermissionManager } from '$lib/server/DatasetPermissionManager';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.auth();
	const user_email = session?.user.email as string;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const dataset = await getDatasetById(id, is_superuser, user_email);
	if (!dataset) {
		error(404, { message: `No dataset found.` });
	}

	if (!is_superuser) {
		const dp = new DatasetPermissionManager(id, user_email);
		const permission = await dp.getBySignedUser();
		if (!(permission && permission >= Permission.READ)) {
			const domain = user_email ? getDomainFromEmail(user_email) : undefined;
			const access_level: AccessLevel = dataset.properties.access_level;
			if (access_level === AccessLevel.PRIVATE) {
				if (dataset.properties.created_user !== user_email) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			} else if (domain && access_level === AccessLevel.ORGANIZATION) {
				if (!dataset.properties.created_user?.endsWith(domain)) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			}
		}
	}

	dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);
	return new Response(JSON.stringify(dataset));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const dataset = await getDatasetById(id, is_superuser, user_email);
	if (!dataset) {
		error(404, { message: `No dataset found.` });
	}

	if (!(dataset.properties.permission === Permission.OWNER)) {
		error(403, { message: `You don't have permission to delete this datasets.` });
	}

	const dsm = new DatasetManager(dataset);
	await dsm.delete(dataset.properties.id as string);

	const azaccount = env.AZURE_STORAGE_ACCOUNT_UPLOAD;
	const dataType = dataset.properties.tags?.find((t) => t.key === 'type')?.value ?? '';
	if (dataType === 'azure' && dataset.properties.url.indexOf(azaccount) > -1) {
		const blobServiceClient = getBlobServiceClient(
			env.AZURE_STORAGE_ACCOUNT_UPLOAD,
			env.AZURE_STORAGE_ACCESS_KEY_UPLOAD
		);
		const containerName = 'userdata';
		const userHash = session.user.id;
		if (dataset.properties.url.indexOf(`${containerName}/${userHash}/datasets`) !== -1) {
			// only generate .ingesting file if the file is under /userdata/{id}/raw folder
			const containerClient = blobServiceClient.getContainerClient(containerName);
			let blobName = dataset.properties.url
				.replace('pmtiles://', '')
				.replace(`${containerClient.url}/`, '')
				.split('?')[0];
			blobName = `${blobName}.ingesting`;
			const blockBlobClient = await containerClient.getBlockBlobClient(blobName);
			const uploadBlobResponse = await blockBlobClient.upload('', 0);
			console.log(
				`Upload .ingesting file (${blobName}) successfully`,
				uploadBlobResponse.requestId
			);
		}
	}

	return new Response(undefined, {
		status: 204
	});
};
