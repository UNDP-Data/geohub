import { z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { getDatasetById, isSuperuser } from '$lib/server/helpers';
import { VectorLayerTypeValues, type VectorLayerTypes } from '$lib/types';
import { datasetDefaultstyleInGeohub } from '$lib/server/schema';
import { db } from '$lib/server/db';
import { error, type RequestEvent } from '@sveltejs/kit';
import { DatasetPermissionManager } from '$lib/server/DatasetPermissionManager';
import { sql } from 'drizzle-orm';

export const Param = z.object({
	id: z.string().describe('Dataset ID'),
	layer: z.string().describe('Band name if it is raster, layer ID if it is vector.'),
	type: z
		.enum(['raster', 'fill', 'symbol', 'line', 'circle', 'heatmap'])
		.describe('Maplibre layer type (fill, line, symbol, circle, heatmap, raster)')
});

const description = `
This endpoint is to update the default layer style for specified dataset

**This endpoint only can be used by the dataset owner or super user.**
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete default layer style for a dataset';
	c.description = description;
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error'),
	400: appError(400, 'Invalid parameter')
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
	const id = param.id;
	const layer_id = param.layer;
	const layer_type: VectorLayerTypes | 'raster' = param.type as VectorLayerTypes | 'raster';

	if (![...VectorLayerTypeValues, 'raster'].includes(layer_type)) {
		error(404, {
			message: `Invalid parameter of type. It must be one of ${[
				...VectorLayerTypeValues,
				'raster'
			].join(', ')}`
		});
	}

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const dataset = await getDatasetById(id, is_superuser, user_email);
	if (!dataset) {
		error(404, { message: `No dataset found.` });
	}

	if (!is_superuser) {
		const dp = new DatasetPermissionManager(id, user_email);
		const permission: Permission = (await dp.getBySignedUser()) as Permission;
		if (!(permission && permission > Permission.READ)) {
			const domain = user_email ? getDomainFromEmail(user_email) : undefined;
			const access_level: AccessLevel = dataset.properties.access_level;
			if (access_level === AccessLevel.PRIVATE) {
				if (dataset.properties.created_user !== user_email) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			} else if (access_level === AccessLevel.ORGANIZATION) {
				if (!dataset.properties.created_user?.endsWith(domain as string)) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			}
		}
	}

	await db.delete(datasetDefaultstyleInGeohub).where(sql`
			${datasetDefaultstyleInGeohub.datasetId} = ${dataset.properties.id}
			AND ${datasetDefaultstyleInGeohub.layerId}= ${layer_id}
			AND ${datasetDefaultstyleInGeohub.layerType}= ${layer_type}
			`);

	return new Response(undefined, {
		status: 204
	});
}
