import { z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { Permission } from '$lib/config/AppConfig';
import { getBlobServiceClient, getDatasetById, isSuperuser } from '$lib/server/helpers';
import { error, type RequestEvent } from '@sveltejs/kit';
import DatasetManager from '$lib/server/DatasetManager';
import { env } from '$env/dynamic/private';

export const Param = z.object({
	id: z.string().describe('Dataset ID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete dataset by ID';
	c.description = 'Delete dataset feature by dataset ID. This endpoint is required to sign in.';
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error')
};

export default async function (
	param: z.infer<typeof Param>,
	{ locals }: RequestEvent
): Promise<Response> {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id = param.id;

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
}
