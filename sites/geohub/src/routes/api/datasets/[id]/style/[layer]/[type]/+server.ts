import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { createAttributionFromTags, getBase64EncodedUrl, getDomainFromEmail } from '$lib/helper';
import {
	createDatasetLinks,
	getDatasetById,
	getDefaultLayerStyle,
	isSuperuser
} from '$lib/server/helpers';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import {
	VectorLayerTypeValues,
	type DatasetDefaultLayerStyle,
	type VectorLayerTypes
} from '$lib/types';
import type { RasterSourceSpecification, VectorSourceSpecification } from 'maplibre-gl';
import RasterDefaultStyle from '$lib/server/defaultStyle/RasterDefaultStyle';
import type { UserConfig } from '$lib/config/DefaultUserConfig';
import { env } from '$env/dynamic/private';
import VectorDefaultStyle from '$lib/server/defaultStyle/VectorDefaultStyle';
import { DatasetPermissionManager } from '$lib/server/DatasetPermissionManager';
import { datasetDefaultstyleInGeohub } from '$lib/server/schema';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals, url, fetch }) => {
	const session = await locals.auth();
	const user_email = session?.user.email;
	const id = params.id;
	const layer_id = params.layer;
	const layer_type: VectorLayerTypes | 'raster' = params.type as VectorLayerTypes | 'raster';
	const colormap_name = url.searchParams.get('colormap_name') as string;

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
	dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);

	const response = await fetch('/api/settings');
	const config: UserConfig = await response.json();

	let data = await getDefaultLayerStyle(dataset.properties.id as string, layer_id, layer_type);
	if (!data) {
		if (layer_type === 'raster') {
			const bandIndex = parseInt(layer_id) - 1;
			const rasterDefaultStyle = new RasterDefaultStyle(dataset, config, bandIndex);
			data = await rasterDefaultStyle.create(colormap_name);
		} else {
			const vectorDefaultStyle = new VectorDefaultStyle(dataset, config, layer_id, layer_type);
			data = await vectorDefaultStyle.create(colormap_name);
		}
	} else {
		const attribution = createAttributionFromTags(dataset.properties.tags);
		const src = data.source as VectorSourceSpecification | RasterSourceSpecification;
		src.attribution = attribution;
	}

	if (layer_type === 'raster') {
		// if titiler URL saved in database is different from actual server settings, replace URL origin to env varaible one.
		const rasterSource = data.source as RasterSourceSpecification;
		const tiles = rasterSource.tiles;
		const titilerUrl = new URL(env.TITILER_ENDPOINT);
		for (let i = 0; i < tiles.length; i++) {
			const url = new URL(tiles[i]);
			if (url.origin !== titilerUrl.origin) {
				tiles[i] = tiles[i].replace(url.origin, titilerUrl.origin);
			}
			// renew sas token from dataset.properties.url
			const tileUrlObj = new URL(tiles[i]);
			tileUrlObj.searchParams.set(
				'url',
				encodeURIComponent(getBase64EncodedUrl(dataset.properties.url))
			);
			tiles[i] = decodeURI(tileUrlObj.href);
		}
	} else {
		const vectorSource = data.source as VectorSourceSpecification;
		const tileUrl = vectorSource.url;
		// renew sas token from dataset.properties.url
		if (tileUrl && tileUrl.startsWith('pmtiles://')) {
			vectorSource.url = dataset.properties.url;
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
};

export const POST: RequestHandler = async ({ params, locals, request }) => {
	const session = await locals.auth();
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
				if (!dataset.properties.created_user.endsWith(domain)) {
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
	return new Response(JSON.stringify(data));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.auth();
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

	const dataset = await getDatasetById(id, is_superuser, user_email);
	if (!dataset) {
		error(404, { message: `No dataset found.` });
	}

	if (!is_superuser) {
		const dp = new DatasetPermissionManager(id, user_email);
		const permission = await dp.getBySignedUser();
		if (!(permission && permission > Permission.READ)) {
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
	}

	await db.delete(datasetDefaultstyleInGeohub).where(sql`
		${datasetDefaultstyleInGeohub.datasetId} = ${dataset.properties.id}
		AND ${datasetDefaultstyleInGeohub.layerId}= ${layer_id}
		AND ${datasetDefaultstyleInGeohub.layerType}= ${layer_type}
		`);

	return new Response(undefined, {
		status: 204
	});
};
