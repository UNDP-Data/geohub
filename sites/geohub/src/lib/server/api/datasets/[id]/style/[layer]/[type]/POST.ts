import { z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { getDatasetById, getDefaultLayerStyle, isSuperuser } from '$lib/server/helpers';
import {
	VectorLayerTypeValues,
	type DatasetDefaultLayerStyle,
	type VectorLayerTypes
} from '$lib/types';
import { datasetDefaultstyleInGeohub } from '$lib/server/schema';
import { db } from '$lib/server/db';
import { error, type RequestEvent } from '@sveltejs/kit';

export const Output = z.custom<DatasetDefaultLayerStyle>().describe('default layer style');

export const Param = z.object({
	id: z.string().describe('Dataset ID').openapi({ example: '8c4810867c50ee006b11abf19876a750' }),
	layer: z
		.string()
		.describe('Band name if it is raster, layer ID if it is vector.')
		.openapi({ example: 'drr.dynamic_subnational_hhr' }),
	type: z
		.enum(['raster', 'fill', 'symbol', 'line', 'circle', 'heatmap', 'fill-extrusion'])
		.describe('Maplibre layer type (fill, line, symbol, circle, heatmap, raster, fill-extrusion)')
		.openapi({ example: 'fill' })
});

export const Input = z
	.custom<DatasetDefaultLayerStyle>()
	.describe('DatasetDefaultLayerStyle object')
	.openapi({
		example: {
			dataset_id: '8c4810867c50ee006b11abf19876a750',
			layer_id: 'drr.dynamic_subnational_hhr',
			layer_type: 'fill',
			source: {
				type: 'vector',
				url: 'https://dev.undpgeohub.org/api/vector/pgtileserv/tile.json?table=drr.dynamic_subnational_hhr&type=function',
				tiles: [
					'https://pgtileserv.undpgeohub.org/drr.dynamic_subnational_hhr/{z}/{x}/{y}.pbf?params={"hdi_adjustment"%3A{"value"%3A5.4}%2C"working_age_pop_adjustment"%3A{"value"%3A-4.9}}'
				]
			},
			style: {
				id: '6b45fc16-6e59-438c-ae7a-57f6dcc8b09c',
				type: 'fill',
				source: '8c4810867c50ee006b11abf19876a750',
				'source-layer': 'drr.dynamic_subnational_hhr',
				minzoom: 0,
				layout: {
					visibility: 'visible'
				},
				paint: {
					'fill-color': {
						type: 'interval',
						property: 'heat_health_risk_index',
						stops: [
							[16.88, 'rgba(158, 1, 66, 1)'],
							[29.78, 'rgba(249, 142, 82, 1)'],
							[43.71, 'rgba(255, 255, 191, 1)'],
							[58.52, 'rgba(137, 208, 165, 1)'],
							[72.71, 'rgba(94, 79, 162, 1)']
						],
						default: 'rgba(0,0,0,0)'
					},
					'fill-outline-color': {
						property: 'heat_health_risk_index',
						type: 'interval',
						stops: [
							[16.88, 'rgba(52, 0, 0, 1)'],
							[29.78, 'rgba(108, 23, 0, 1)'],
							[43.71, 'rgba(125, 127, 70, 1)'],
							[58.52, 'rgba(5, 85, 50, 1)'],
							[72.71, 'rgba(0, 0, 47, 1)']
						],
						default: 'rgba(0,0,0,0)'
					},
					'fill-opacity': 1
				}
			},
			colormap_name: 'spectral',
			classification_method: 'q'
		} as DatasetDefaultLayerStyle
	});

const description = `
This endpoint is to register the default layer style for specified dataset.

This endpoint will replace \`style.id\` to \`style.id={layer_id}\` and \`style.source\` to \`style.source={source_id}\`. When you use this default style in maplibre, please generate unique layer ID and soruce ID, then replace them before adding layer to maplibre.

**This endpoint only can be used by the dataset owner or super user.**
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Register default layer style for a dataset';
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
	{ locals, request }: RequestEvent
): Promise<z.infer<typeof Output>> {
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
		if (!(dataset.properties.permission && dataset.properties.permission > Permission.READ)) {
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

	const body: DatasetDefaultLayerStyle = await request.json();
	const now = new Date().toISOString();

	const source = body.source;
	if (!source) {
		error(400, { message: `Source property is required to register.` });
	}
	const style = body.style;
	if (!body.style) {
		error(400, { message: `Style property is required to register.` });
	}
	if (style.type !== layer_type) {
		error(400, {
			message: `Layer type in path param does not match to style object in body.`
		});
	}
	// replace layer_id and source_id to variable
	style.id = '{layer_id}';
	style.source = '{source_id}';

	const colormap_name = body.colormap_name;
	const classification_method = body.classification_method;
	const classification_method_2 = body.classification_method_2;

	await db
		.insert(datasetDefaultstyleInGeohub)
		.values({
			datasetId: dataset.properties.id as string,
			layerId: layer_id,
			layerType: layer_type,
			source: source,
			style: style,
			colormapName: colormap_name,
			classificationMethod: classification_method,
			classificationMethod2: classification_method_2,
			createdUser: user_email,
			createdat: now
		})
		.onConflictDoUpdate({
			target: [
				datasetDefaultstyleInGeohub.datasetId,
				datasetDefaultstyleInGeohub.layerId,
				datasetDefaultstyleInGeohub.layerType
			],
			set: {
				layerId: layer_id,
				layerType: layer_type,
				source: source,
				style: style,
				colormapName: colormap_name,
				classificationMethod: classification_method,
				classificationMethod2: classification_method_2,
				updatedUser: user_email,
				updatedat: now
			}
		});

	const data = await getDefaultLayerStyle(dataset.properties.id as string, layer_id, layer_type);
	return data as DatasetDefaultLayerStyle;
}

// export default new Endpoint({ Param, Query, Input, Output, Modifier, Error }).handle(
// 	async (param, { locals, request }) => {

// 	}
// );
