import type { RequestHandler } from './$types';
import {
	createDatasetLinks,
	getDatasetById,
	isSuperuser,
	pageNumber,
	parseCqlFilter
} from '$lib/server/helpers';
import { env } from '$env/dynamic/private';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { DatasetPermissionManager } from '$lib/server/DatasetPermissionManager';
import { error } from '@sveltejs/kit';
import type { Link, Pages, VectorTileMetadata } from '$lib/types';
import { geojson } from 'flatgeobuf';
import type { Feature } from 'geojson';
import { utils, write } from 'xlsx';

const SUPPORTED_FORMATS = ['json', 'csv', 'geojson', 'xlsx'];

export const GET: RequestHandler = async ({ params, locals, url, fetch }) => {
	const session = await locals.auth();
	const user_email = session?.user.email as string;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const id: string = params.id;
	const layer: string = params.layer.toLowerCase();
	const format: string = params.format.toLowerCase();
	if (!SUPPORTED_FORMATS.includes(format)) {
		error(400, {
			message: `${format} is not supported. Please select it from ${SUPPORTED_FORMATS.join(', ')}`
		});
	}

	const _limit = url.searchParams.get('limit') || 1000;
	const limit = Number(_limit);
	const _offset = url.searchParams.get('offset') || 0;
	const offset = Number(_offset);

	const dataset = await getDatasetById(id, is_superuser, user_email);
	if (!dataset) {
		error(404, { message: `No dataset found.` });
	}

	if (dataset.properties.is_raster === true) {
		error(400, { message: 'The endpoint does not support raster dataset.' });
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

	const metadataUrl = dataset.properties.links?.find((l) => l.rel === 'metadatajson')?.href;
	if (!metadataUrl) {
		error(400, { message: 'Invalid dataset. It cannot fetch metadata' });
	}

	const resMetadata = await fetch(metadataUrl);
	const metadata: VectorTileMetadata = await resMetadata.json();
	if (!metadata.json) {
		error(400, { message: 'Invalid dataset. No metadata available from this dataset.' });
	}
	const availableLayers = metadata.json.vector_layers.map((l) => l.id);
	if (availableLayers.length === 0) {
		error(400, { message: 'This dataset does not have any vector layer.' });
	}
	const layerMeta = metadata.json.vector_layers.find((l) => l.id.toLowerCase() === layer);
	if (!layerMeta) {
		error(404, {
			message: `layer id: ${layer} is not available in this dataset. Please select it from ${availableLayers.join(', ')}`
		});
	}

	let pmttilesUrl = dataset.properties.url;
	if (!pmttilesUrl?.startsWith('pmtiles://')) {
		error(400, { message: 'The endpoint does not support this dataset' });
	}
	pmttilesUrl = pmttilesUrl.replace('pmtiles://', '');

	const fgbUrls = dataset.properties.links?.filter((l) => l.rel.startsWith('flatgeobuf'));
	if (!(fgbUrls && fgbUrls.length > 0)) {
		error(404, { message: 'Flatgeobuf file does not exist.' });
	}

	let fgbUrl = fgbUrls.find((l) => l.rel === 'flatgeobuf')?.href;
	if (availableLayers.length > 1) {
		fgbUrl = fgbUrls.find((l) => l.rel === `flatgeobuf-${layerMeta.id}`)?.href;
	}
	if (!fgbUrl) {
		error(404, { message: 'Flatgeobuf file does not exist.' });
	}

	// extract default bounds from metadata
	const bounds = metadata.bounds?.split(',').map((val) => Number(val));
	const rect = {
		maxX: bounds[2],
		maxY: bounds[3],
		minX: bounds[0],
		minY: bounds[1]
	};

	// if bbox is specified, but it cannot be beyond dataset bounds
	const _bbox = url.searchParams.get('bbox')?.split(',') as string[];
	const bbox = _bbox?.map((b) => parseFloat(b.trim()));
	if (bbox) {
		if (bbox.length !== 4) {
			error(400, { message: `Invalid format of bbox. It should be minx,miny,maxx,maxy` });
		}
		if (rect.maxX > bbox[2]) {
			rect.maxX = bbox[2];
		}
		if (rect.maxY > bbox[3]) {
			rect.maxY = bbox[3];
		}
		if (rect.minX < bbox[0]) {
			rect.minX = bbox[0];
		}
		if (rect.minY < bbox[1]) {
			rect.minY = bbox[1];
		}
	}

	const fc: { type: 'FeatureCollection'; features: Feature[]; links?: Link[]; pages?: Pages } = {
		type: 'FeatureCollection',
		features: []
	};

	const query = url.searchParams.get('query')?.toLowerCase() ?? '';

	const iter = geojson.deserialize(fgbUrl.toString(), rect);
	for await (const feature of iter) {
		// if query is specified in queryparam, it search all properties to return matched features
		if (query.length > 0) {
			const props = feature.properties as { [key: string]: number | string };
			let isMatched = false;
			for (const key of Object.keys(props)) {
				const value = props[key];
				if (typeof value === 'string') {
					if (value.toLowerCase().indexOf(query) !== -1) {
						isMatched = true;
						break;
					}
				} else if (typeof value === 'number') {
					if (`${value}` === query) {
						isMatched = true;
						break;
					}
				}
			}
			if (!isMatched) continue;
		}
		fc.features.push({ ...feature, id: fc.features.length + 1 });
	}

	const cqlFilter = url.searchParams.get('cql_filter');
	if (cqlFilter) {
		fc.features = parseCqlFilter(cqlFilter, fc.features);
	}

	// sort by target column
	const sortby = url.searchParams.get('sortby');
	let sortByColumn = '';
	let SortOrder: 'asc' | 'desc' = 'asc';
	if (sortby) {
		const values = sortby.split(',');
		const column: string = values[0].trim().toLowerCase();
		const tilestats = metadata.json.tilestats?.layers.find((l) => l.layer === layerMeta.id);
		if (tilestats) {
			const targetSortingColumns = tilestats.attributes.map((attr) => attr.attribute);
			const targetSortingOrder = ['asc', 'desc'];
			if (!targetSortingColumns.includes(column)) {
				error(400, {
					message: `Bad parameter for 'sortby'. It must be one of '${targetSortingColumns.join(
						', '
					)}'`
				});
			}
			sortByColumn = column;

			if (values.length > 1) {
				const order: string = values[1].trim().toLowerCase();
				if (!targetSortingOrder.includes(order)) {
					error(400, {
						message: `Bad parameter for 'sortby'. Sorting order must be one of '${targetSortingOrder.join(
							', '
						)}'`
					});
				}
				SortOrder = order as 'asc' | 'desc';
			}
		}
		fc.features = fc.features.sort((a, b) => {
			if (!(a.properties && b.properties)) return 0;
			if (SortOrder === 'asc') {
				return a.properties[sortByColumn] < b.properties[sortByColumn] ? -1 : 1;
			} else {
				return a.properties[sortByColumn] > b.properties[sortByColumn] ? -1 : 1;
			}
		});
	}

	const totalCount = fc.features.length;
	// extract data by limit and offset
	fc.features = [...fc.features.splice(offset, limit)];

	// pagination info
	let totalPages = Math.ceil(totalCount / Number(limit));
	if (totalPages === 0) {
		totalPages = 1;
	}
	const currentPage = pageNumber(totalCount, Number(limit), Number(offset));
	fc.pages = {
		totalCount,
		totalPages,
		currentPage
	};

	// links information
	const nextUrl = new URL(url.toString());
	nextUrl.searchParams.set('limit', limit.toString());
	nextUrl.searchParams.set('offset', (offset + limit).toString());
	let links: Link[] = [
		{
			rel: 'root',
			type: 'application/json',
			href: `${url.origin}${url.pathname}`
		},
		{
			rel: 'self',
			type: 'application/json',
			href: url.toString()
		},
		{
			rel: 'dataset',
			type: 'application/json',
			href: `${url.origin}/api/datasets/${dataset.properties.id}`
		}
	];

	if (fc.features.length === limit) {
		links.push({
			rel: 'next',
			type: 'application/json',
			href: nextUrl.toString()
		});
	}

	if (offset > 0) {
		const previoustUrl = new URL(url.toString());
		previoustUrl.searchParams.set('limit', limit.toString());
		previoustUrl.searchParams.set('offset', (offset - limit).toString());

		links.push({
			rel: 'previous',
			type: 'application/json',
			href: previoustUrl.toString()
		});
	}
	if (totalPages === currentPage) {
		// remove next link if it is the last page
		links = links.filter((l) => !['next'].includes(l.rel));
	}
	fc.links = links;

	if (format === 'csv') {
		const data = fc.features.map((f) => f.properties) as { [key: string]: string | number }[];
		const csv = jsonToCsv(data);
		return new Response(csv, {
			headers: {
				'Content-type': 'text/csv'
			}
		});
	} else if (format === 'xlsx') {
		const data = fc.features.map((f) => f.properties) as { [key: string]: string | number }[];
		const csv = jsonToXlsx(data, layerMeta.id);
		return new Response(csv, {
			headers: {
				'Content-type': 'application/octet-stream'
			}
		});
	} else if (format === 'json') {
		for (let i = 0; i < fc.features.length; i++) {
			fc.features[i] = {
				type: fc.features[i].type,
				properties: fc.features[i].properties
			} as unknown as Feature;
		}
		return new Response(JSON.stringify(fc));
	} else {
		return new Response(JSON.stringify(fc));
	}
};

const jsonToCsv = (jsonData: { [key: string]: string | number }[]) => {
	let csv = '';

	if (jsonData.length === 0) {
		return csv;
	}

	// Extract headers
	const headers = Object.keys(jsonData[0]);
	csv += headers.join(',') + '\n';

	// Extract values
	jsonData.forEach((obj: { [x: string]: string | number }) => {
		const values = headers.map((header) => {
			if (typeof obj[header] === 'string') {
				return `"${obj[header]}"`;
			} else {
				return obj[header];
			}
		});
		csv += values.join(',') + '\n';
	});

	return csv;
};

const jsonToXlsx = (jsonData: { [key: string]: string | number }[], sheetName: string) => {
	const worksheet = utils.json_to_sheet(jsonData);
	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, worksheet, sheetName);
	const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
	const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
	return blob;
};
