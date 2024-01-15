import { AccessLevel } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import {
	createDatasetLinks,
	getDatasetById,
	getDefaultLayerStyle,
	isSuperuser
} from '$lib/server/helpers';
import type { PoolClient } from 'pg';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import DatabaseManager from '$lib/server/DatabaseManager';
import {
	VectorLayerTypeValues,
	type DatasetDefaultLayerStyle,
	type VectorLayerTypes
} from '$lib/types';
import type { VectorSourceSpecification } from 'maplibre-gl';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { env } from '$env/dynamic/private';
import VectorDefaultStyle from '$lib/server/defaultStyle/VectorDefaultStyle';

export const GET: RequestHandler = async ({ params, locals, url, fetch }) => {
	const session = await locals.getSession();
	const user_email = session?.user.email;
	const id = params.id;
	const layer_id = params.layer;
	const layer_type: VectorLayerTypes | 'raster' = params.type as VectorLayerTypes | 'raster';
	const colormap_name = url.searchParams.get('colormap_name');

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

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dataset = await getDataset(client, id, is_superuser, user_email);
		dataset.properties = createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);

		const response = await fetch('/api/settings');
		const config: UserConfig = await response.json();

		let data = await getDefaultLayerStyle(client, dataset.properties.id, layer_id, layer_type);
		if (!data) {
			if (layer_type === 'raster') {
				const bandIndex = parseInt(layer_id) - 1;
				const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
				data = await rasterDefaultStyle.create(colormap_name);
			} else {
				const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
				data = await vectorDefaultStyle.create(colormap_name);
			}
		}

		if (!data.metadata) {
			if (layer_type === 'raster') {
				const bandIndex = parseInt(layer_id) - 1;
				const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
				data.metadata = await rasterDefaultStyle.getMetadata();
			} else {
				const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
				data.metadata = await vectorDefaultStyle.getMetadata();
			}
		}

		const isPgTileServ =
			dataset.properties.tags?.find((t) => t.key === 'type')?.value === 'pgtileserv';
		if (isPgTileServ) {
			const type = data.source.type;
			if (type === 'vector') {
				const vectorSource = data.source as VectorSourceSpecification;
				if (vectorSource.url) {
					const originalUrl = new URL(vectorSource.url);
					if (originalUrl.origin !== url.origin) {
						const originalUrl = new URL(vectorSource.url);
						vectorSource.url = `${url.origin}${originalUrl.pathname}${originalUrl.search}`;
					}
				}
			}
		}

		return new Response(JSON.stringify(data));
	} finally {
		dbm.end();
	}
};

export const POST: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.getSession();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;
	const id = params.id;
	const layer_id = params.layer;
	const layer_type: VectorLayerTypes | 'raster' = params.type as VectorLayerTypes | 'raster';

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

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dataset = await getDataset(client, id, is_superuser, user_email);

		if (!is_superuser) {
			const domain = user_email ? getDomainFromEmail(user_email) : undefined;
			const access_level: AccessLevel = dataset.properties.access_level;
			if (access_level === AccessLevel.PRIVATE) {
				if (dataset.properties.created_user !== user_email) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			} else if (access_level === AccessLevel.ORGANIZATION) {
				if (!dataset.properties.created_user.endsWith(domain)) {
					error(403, { message: `No permission to access to this dataset.` });
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

		const query = {
			text: `
            INSERT INTO geohub.dataset_defaultstyle
            (
                dataset_id,
                layer_id,
                layer_type,
                source,
                style,
                colormap_name,
                classification_method,
				classification_method_2,
                created_user,
                createdat
            ) 
            VALUES (
                $1, 
                $2, 
                $3, 
                $4, 
                $5, 
                $6, 
                $7, 
                $8,
				$9, 
                $10::timestamptz
            ) 
            ON CONFLICT (dataset_id, layer_id, layer_type) 
            DO UPDATE 
            SET 
                source = $4,
                style = $5,
                colormap_name = $6,
                classification_method = $7,
				classification_method_2 = $8,
                updated_user = $11,
                updatedat = $12::timestamptz
        `,
			values: [
				dataset.properties.id,
				layer_id,
				layer_type,
				source,
				style,
				colormap_name,
				classification_method,
				classification_method_2,
				user_email,
				now,
				user_email,
				now
			]
		};

		await client.query(query);

		const data = await getDefaultLayerStyle(client, dataset.properties.id, layer_id, layer_type);
		return new Response(JSON.stringify(data));
	} finally {
		dbm.end();
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.getSession();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;
	const id = params.id;
	const layer_id = params.layer;
	const layer_type: VectorLayerTypes | 'raster' = params.type as VectorLayerTypes | 'raster';

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

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dataset = await getDataset(client, id, is_superuser, user_email);

		if (!is_superuser) {
			const domain = user_email ? getDomainFromEmail(user_email) : undefined;
			const access_level: AccessLevel = dataset.properties.access_level;
			if (access_level === AccessLevel.PRIVATE) {
				if (dataset.properties.created_user !== user_email) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			} else if (access_level === AccessLevel.ORGANIZATION) {
				if (!dataset.properties.created_user.endsWith(domain)) {
					error(403, { message: `No permission to access to this dataset.` });
				}
			}
		}

		const query = {
			text: `
            DELETE FROM geohub.dataset_defaultstyle
            WHERE
                dataset_id=$1
                AND layer_id=$2
                AND layer_type=$3
        `,
			values: [dataset.properties.id, layer_id, layer_type]
		};

		await client.query(query);

		return new Response(undefined, {
			status: 204
		});
	} finally {
		dbm.end();
	}
};

const getDataset = async (
	client: PoolClient,
	id: string,
	is_superuser: boolean,
	user_email?: string
) => {
	const dataset = await getDatasetById(client, id, is_superuser, user_email);
	if (!dataset) {
		error(404, { message: `No dataset found.` });
	}
	return dataset;
};
