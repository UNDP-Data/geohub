import type { RequestHandler } from './$types';
import {
	createDatasetLinks,
	getBlobServiceClient,
	getDatasetById,
	isSuperuser
} from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import DatasetManager from '$lib/server/DatasetManager';
import { env } from '$env/dynamic/private';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { DatasetPermissionManager } from '$lib/server/DatasetPermissionManager';

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.getSession();
	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dataset = await getDatasetById(client, id, is_superuser, user_email);
		if (!dataset) {
			return new Response(JSON.stringify({ message: `No dataset found.` }), {
				status: 404
			});
		}

		if (!is_superuser) {
			const dp = new DatasetPermissionManager(id, user_email);
			const permission = await dp.getBySignedUser(client);
			if (!(permission && permission >= Permission.READ)) {
				const domain = user_email ? getDomainFromEmail(user_email) : undefined;
				const access_level: AccessLevel = dataset.properties.access_level;
				if (access_level === AccessLevel.PRIVATE) {
					if (dataset.properties.created_user !== user_email) {
						return new Response(
							JSON.stringify({ message: `No permission to access to this dataset.` }),
							{
								status: 403
							}
						);
					}
				} else if (access_level === AccessLevel.ORGANIZATION) {
					if (!dataset.properties.created_user.endsWith(domain)) {
						return new Response(
							JSON.stringify({ message: `No permission to access to this dataset.` }),
							{
								status: 403
							}
						);
					}
				}
			}
		}

		dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);
		return new Response(JSON.stringify(dataset));
	} finally {
		dbm.end();
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
	}
	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = params.id;

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const dataset = await getDatasetById(client, id, is_superuser, user_email);
		if (!dataset) {
			return new Response(JSON.stringify({ message: `No dataset found.` }), {
				status: 404
			});
		}

		if (!(dataset.properties.permission === Permission.OWNER)) {
			return new Response(
				JSON.stringify({ message: `You don't have permission to delete this datasets.` }),
				{
					status: 403
				}
			);
		}

		const dsm = new DatasetManager(dataset);
		await dsm.delete(client, dataset.properties.id);

		const azaccount = env.AZURE_STORAGE_ACCOUNT_UPLOAD;
		if (dataset.properties.url.indexOf(azaccount) > -1) {
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
	} catch (err) {
		await dbm.transactionRollback();
		throw err;
	} finally {
		await dbm.transactionEnd();
	}
};
