import { AccessLevel } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { getDatasetById, getDefaultLayerStyle } from '$lib/server/helpers';
import type { PoolClient } from 'pg';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import DatabaseManager from '$lib/server/DatabaseManager';
import type { DatasetDefaultLayerStyle } from '$lib/types';
import type { VectorSourceSpecification } from 'maplibre-gl';

const LAYER_TYPES = ['raster', 'fill', 'symbol', 'line', 'circle', 'heatmap'];

export const GET: RequestHandler = async ({ params, locals, url }) => {
	const session = await locals.getSession();
	const user_email = session?.user.email;
	const id = params.id;
	const layer_id = params.layer;
	const layer_type = params.type;

	if (!LAYER_TYPES.includes(layer_type)) {
		throw error(404, {
			message: `Invalid parameter of type. It must be one of ${LAYER_TYPES.join(', ')}`
		});
	}

	const is_superuser = session?.user?.is_superuser ?? false;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dataset = await getDataset(client, id, is_superuser, user_email);

		const data = await getDefaultLayerStyle(client, dataset.properties.id, layer_id, layer_type);
		if (!data) {
			throw error(404, {
				message: `No style found for layer=${layer_id}; layer_type=${layer_type} in the dataset of ${dataset.properties.name}`
			});
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
		throw error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;
	const id = params.id;
	const layer_id = params.layer;
	const layer_type = params.type;

	if (!LAYER_TYPES.includes(layer_type)) {
		throw error(404, {
			message: `Invalid parameter of type. It must be one of ${LAYER_TYPES.join(', ')}`
		});
	}

	const is_superuser = session?.user?.is_superuser ?? false;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dataset = await getDataset(client, id, is_superuser, user_email);

		if (!is_superuser) {
			const domain = user_email ? getDomainFromEmail(user_email) : undefined;
			const access_level: AccessLevel = dataset.properties.access_level;
			if (access_level === AccessLevel.PRIVATE) {
				if (dataset.properties.created_user !== user_email) {
					throw error(403, { message: `No permission to access to this dataset.` });
				}
			} else if (access_level === AccessLevel.ORGANIZATION) {
				if (!dataset.properties.created_user.endsWith(domain)) {
					throw error(403, { message: `No permission to access to this dataset.` });
				}
			}
		}

		const body: DatasetDefaultLayerStyle = await request.json();
		const now = new Date().toISOString();

		const source = body.source;
		if (!source) {
			throw error(400, { message: `Source property is required to register.` });
		}
		const style = body.style;
		if (!body.style) {
			throw error(400, { message: `Style property is required to register.` });
		}
		if (style.type !== layer_type) {
			throw error(400, {
				message: `Layer type in path param does not match to style object in body.`
			});
		}
		// replace layer_id and source_id to variable
		style.id = '{layer_id}';
		style.source = '{source_id}';

		const colormap_name = body.colormap_name;
		const classification_method = body.classification_method;

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
                $9::timestamptz
            ) 
            ON CONFLICT (dataset_id, layer_id, layer_type) 
            DO UPDATE 
            SET 
                source = $4,
                style = $5,
                colormap_name = $6,
                classification_method = $7,
                updated_user = $10,
                updatedat = $11::timestamptz
        `,
			values: [
				dataset.properties.id,
				layer_id,
				layer_type,
				source,
				style,
				colormap_name,
				classification_method,
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
		throw error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;
	const id = params.id;
	const layer_id = params.layer;
	const layer_type = params.type;

	if (!LAYER_TYPES.includes(layer_type)) {
		throw error(404, {
			message: `Invalid parameter of type. It must be one of ${LAYER_TYPES.join(', ')}`
		});
	}

	const is_superuser = session?.user?.is_superuser ?? false;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const dataset = await getDataset(client, id, is_superuser, user_email);

		if (!is_superuser) {
			const domain = user_email ? getDomainFromEmail(user_email) : undefined;
			const access_level: AccessLevel = dataset.properties.access_level;
			if (access_level === AccessLevel.PRIVATE) {
				if (dataset.properties.created_user !== user_email) {
					throw error(403, { message: `No permission to access to this dataset.` });
				}
			} else if (access_level === AccessLevel.ORGANIZATION) {
				if (!dataset.properties.created_user.endsWith(domain)) {
					throw error(403, { message: `No permission to access to this dataset.` });
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
		throw error(404, { message: `No dataset found.` });
	}
	return dataset;
};
