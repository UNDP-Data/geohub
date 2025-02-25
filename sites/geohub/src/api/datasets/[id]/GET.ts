import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { DatasetPermissionManager } from '$lib/server/DatasetPermissionManager';
import { createDatasetLinks, getDatasetById, isSuperuser } from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { DatasetFeature } from '$lib/types';

export const Output = z.custom<DatasetFeature>().describe('dataset feature');

export const Param = z.object({
	id: z.string().describe('Dataset ID')
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get dataset feature by ID';
	c.description = 'Get dataset feature by dataset ID';
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Param, Output, Modifier, Error }).handle(
	async (param, { locals, url }) => {
		const session = await locals.auth();
		const user_email = session?.user.email as string;
		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const id = param.id;

		const dataset = await getDatasetById(id, is_superuser, user_email);
		if (!dataset) {
			error(404, { message: `No dataset found.` });
		}

		if (!is_superuser) {
			const dp = new DatasetPermissionManager(id, user_email);
			const permission = (await dp.getBySignedUser()) as Permission;
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
		return dataset;
	}
);
