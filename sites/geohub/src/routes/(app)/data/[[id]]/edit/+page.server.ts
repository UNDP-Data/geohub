import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import type {
	Continent,
	Country,
	DatasetFeature,
	PgtileservDetailJson,
	PgtileservIndexJson,
	Region,
	Tag
} from '$lib/types';
import {
	createDatasetLinks,
	generateAzureBlobSasToken,
	getRasterMetadata,
	getVectorMetadata,
	isGeoHubBlobStorage
} from '$lib/server/helpers';
import { isRasterExtension, generateHashKey } from '$lib/helper';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { env } from '$env/dynamic/private';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import {
	clean,
	type VectorLayerMetadata,
	type VectorLayerTileStatLayer
} from '@undp-data/svelte-undp-components';
import { PMTiles } from 'pmtiles';

interface PmTilesMetadata {
	format: string;
	vector_layers?: VectorLayerMetadata[];
	tilestats?: {
		layerCount: number;
		layers: VectorLayerTileStatLayer[];
	};
}

/**
 * Preload dataset metadata from either database (existing case) or titiler/pmtiles (new case)
 * to generate Feature geojson object for data updating.
 */
export const load: PageServerLoad = async (event) => {
	const { url, params, parent } = event;
	const id = params.id;

	const { session } = await parent();
	if (!session) {
		error(403, {
			message: `No permission to access.`
		});
	}

	let datasetUrl = url.searchParams.get('url');
	if (!datasetUrl) {
		error(400, {
			message: `url query parameter is required.`
		});
	}
	datasetUrl = datasetUrl.replace('pmtiles://', '');

	const datasetId = generateHashKey(datasetUrl);

	const names = new URL(datasetUrl).pathname.split('.');
	const extention = names[names.length - 1];
	const isPmtiles = extention.toLowerCase() === 'pmtiles' ? true : false;

	let isNew = !id ? true : false;

	if (id && id !== datasetId) {
		error(400, { message: 'Dataset ID and URL does not match.' });
	}

	const apiUrl = `/api/datasets/${datasetId}`;
	const res = await event.fetch(apiUrl);
	if (!res.ok && res.status !== 404) error(500, { message: res.statusText });
	isNew = res.status === 404;
	if (!id && !isNew) {
		// if existing data without [id] path param, it redirects to the correct URL.
		redirect(301, `/data/${datasetId}/edit${url.search}`);
	}

	let feature: DatasetFeature = await res.json();

	if (isNew === true) {
		const isPgtileservData = datasetUrl.indexOf(env.PGTILESERV_API_ENDPOINT) === -1 ? false : true;

		if (isPgtileservData) {
			// for new datasets in pgtileserv
			const layerId = datasetUrl
				.replace(`${env.PGTILESERV_API_ENDPOINT}/`, '')
				.replace('/{z}/{x}/{y}.pbf', '');
			const indexJsonUrl = `${env.PGTILESERV_API_ENDPOINT}/index.json`;
			const res = await event.fetch(indexJsonUrl);
			const indexJson: PgtileservIndexJson = await res.json();
			const layer = indexJson[layerId];
			const resDetail = await event.fetch(indexJson[layerId].detailurl);
			const detailJson: PgtileservDetailJson = await resDetail.json();

			const tags: Tag[] = [
				{
					key: 'type',
					value: 'pgtileserv'
				},
				{
					key: 'layertype',
					value: layer.type
				},
				{
					key: 'schema',
					value: layer.schema
				},
				{
					key: 'table',
					value: layer.name
				},
				{
					key: 'id',
					value: layer.id
				}
			];

			if (detailJson.geometrytype) {
				tags?.push({
					key: 'geometrytype',
					value: detailJson.geometrytype
				});
			}

			let bounds = detailJson.bounds;
			if (!bounds) {
				bounds = [-180, -90, 180, 90];
			}

			feature = {
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[bounds[0], bounds[1]],
							[bounds[2], bounds[1]],
							[bounds[2], bounds[3]],
							[bounds[0], bounds[3]],
							[bounds[0], bounds[1]]
						]
					]
				},
				properties: {
					id: datasetId,
					url: detailJson.tileurl,
					name: clean(layer.name),
					description: layer.description,
					is_raster: false,
					access_level: AccessLevel.PUBLIC,
					tags
				}
			};
		} else {
			// for new datasets in Azure Blob container
			const isGeoHubStorage = isGeoHubBlobStorage(datasetUrl);

			const is_raster = isRasterExtension(datasetUrl);
			const metadata = is_raster
				? await getRasterMetadata(datasetUrl)
				: await getVectorMetadata(datasetUrl);
			const tags: Tag[] = [];
			if (isGeoHubStorage) {
				tags.push({
					key: 'type',
					value: 'azure'
				});
			}
			if (metadata.source) {
				const sources = metadata.source.split(',');
				sources.forEach((src) => {
					tags.push({
						key: 'provider',
						value: src.trim()
					});
				});
			}

			if (isGeoHubStorage) {
				const sasToken = await generateAzureBlobSasToken(datasetUrl);
				datasetUrl = `${datasetUrl}${sasToken}`;
			}

			if (isPmtiles) {
				// check metadata
				const pmtiles = new PMTiles(datasetUrl);
				const meta: PmTilesMetadata = (await pmtiles.getMetadata()) as PmTilesMetadata;
				if (!('tilestats' in meta)) {
					error(400, {
						message: 'no tilestats property in metadata in this PMTiles. Cannot import to GeoHub.'
					});
				} else if (!('vector_layers' in meta)) {
					error(400, {
						message:
							'no vector_layers property in metadata in this PMTiles. Cannot import to GeoHub.'
					});
				} else if ('format' in meta && meta.format !== 'pbf') {
					error(400, {
						message:
							'Only PBF format can be used for PMTiles. Cannot import to GeoHub. Use COG file for raster instead.'
					});
				}
			}

			feature = {
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[metadata.bounds[0], metadata.bounds[1]],
							[metadata.bounds[2], metadata.bounds[1]],
							[metadata.bounds[2], metadata.bounds[3]],
							[metadata.bounds[0], metadata.bounds[3]],
							[metadata.bounds[0], metadata.bounds[1]]
						]
					]
				},
				properties: {
					id: datasetId,
					url: `${isPmtiles ? 'pmtiles://' : ''}${datasetUrl}`,
					name: metadata.name,
					description: metadata.description,
					is_raster,
					access_level: AccessLevel.PUBLIC,
					tags
				}
			};
		}
	} else {
		// existing datasets
		// check write permission of login user for datasets
		if (!(feature.properties.permission > Permission.READ)) {
			error(403, { message: 'No permission to access this dataset' });
		}
	}

	feature.properties = await createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);

	const title = 'Data publish | GeoHub';
	const content = 'Data publish';

	return {
		title,
		content,
		feature,
		continents: await getContinents(fetch, url),
		regions: await getRegions(fetch, url),
		countries: await getCountries(fetch, url),
		isNew
	};
};

const getContinents = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const res = await fetch(`${url.origin}/api/continents`);
	const json = await res.json();
	return json as Continent[];
};

const getRegions = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const res = await fetch(`${url.origin}/api/regions`);
	const json = await res.json();
	return json as Region[];
};

const getCountries = async (
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	url: URL
) => {
	const res = await fetch(`${url.origin}/api/countries`);
	const json = await res.json();
	return json as Country[];
};

export const actions = {
	/**
	 * An action to update / register dataset metadata
	 */
	publish: async (event) => {
		const { request, locals, fetch } = event;
		try {
			const session = await locals.auth();
			if (!session) {
				return fail(403, { message: 'No permission' });
			}
			const data = await request.formData();

			const name = data.get('name') as string;
			if (!name) {
				return fail(400, { type: 'danger', message: 'Dataset name is required' });
			}

			const license = data.get('license') as string;
			if (!license) {
				return fail(400, { type: 'danger', message: 'License is required' });
			}

			const description = data.get('description') as string;
			if (!description) {
				return fail(400, { type: 'danger', message: 'Dataset description is required' });
			}

			const accessLevel = data.get('accessLevel') as string;
			if (!accessLevel) {
				return fail(400, { type: 'danger', message: 'Dataset accessLevel is required' });
			}

			const tagsStr = data.get('tags') as string;
			const tags: Tag[] = tagsStr ? JSON.parse(tagsStr) : '';

			if (tags.filter((t) => t.key === 'provider').length === 0) {
				return fail(400, { type: 'danger', message: 'Data provider is required' });
			}

			const featureString = data.get('feature') as string;
			const dataset: DatasetFeature = JSON.parse(featureString);
			dataset.properties.name = name;
			dataset.properties.license = license;
			dataset.properties.description = description;
			dataset.properties.tags = tags;
			dataset.properties.access_level = parseInt(accessLevel);
			const res = await fetch(`/api/datasets`, {
				method: 'POST',
				body: JSON.stringify(dataset)
			});
			if (!res.ok) {
				return fail(res.status, { type: 'error', message: res.statusText });
			}
			const updatedDataset: DatasetFeature = await res.json();
			return updatedDataset;
		} catch (error) {
			return fail(500, { status: error.status, message: 'error:' + error.message });
		}
	}
} satisfies Actions;
