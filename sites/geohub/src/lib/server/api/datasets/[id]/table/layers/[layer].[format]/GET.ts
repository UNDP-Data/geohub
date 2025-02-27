import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import {
	createDatasetLinks,
	getDatasetById,
	isSuperuser,
	pageNumber,
	parseCqlFilter
} from '$lib/server/helpers';
import { env } from '$env/dynamic/private';
import { AccessLevel, Permission, SupportedTableFormats } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { DatasetPermissionManager } from '$lib/server/DatasetPermissionManager';
import { error } from '@sveltejs/kit';
import type { Link, Pages } from '$lib/types';
import { geojson } from 'flatgeobuf';
import type { Feature, FeatureCollection } from 'geojson';
import { utils, write } from 'xlsx';
import type { VectorTileMetadata } from '@undp-data/svelte-undp-components';

export const Output = z
	.custom<FeatureCollection>()
	.or(z.custom<ReadableStream<Uint8Array<ArrayBufferLike>>>())
	.or(z.custom<Response>())
	.describe(
		'Feature collection of attribute data. If compress is true, it returns gzipped compressed data.'
	);

export const Param = z.object({
	id: z.string().describe('Dataset ID').openapi({ example: '4ca2ead25b5903e8e1c7897f8f3bae38' }),
	layer: z
		.string()
		.describe(`a layer ID. This should be equivalent to maplibre's source layer ID.`)
		.openapi({ example: 'zanzibar_tourism_attractions' }),
	format: z
		.enum([...SupportedTableFormats] as [string, ...string[]])
		.describe(`Table format either json or csv or geojson or xlsx. default is json.`)
});

export const Query = z.object({
	query: z.string().optional().describe('optional. text to query attribute table.'),
	limit: z
		.string()
		.optional()
		.default('1000')
		.describe('optional. limit the number of features to return. default is 1000.'),
	offset: z
		.string()
		.optional()
		.default('0')
		.describe('optional. default is 0. Use it for pagination.'),
	bbox: z
		.string()
		.optional()
		.describe('optional. bbox (minx, miny, maxx, maxy) for filtering by geospatial'),
	sortby: z
		.string()
		.optional()
		.describe('optional. sorting column. format should be `{field name},{asc|desc}`'),
	cql_filter: z.string().optional().describe('optional. CQL filter to search data'),
	compress: z
		.enum(['true', 'false'])
		.optional()
		.default('false')
		.describe(
			'optional. default is false. If true, compress response as gzip using compress api. Only available for either json or geojson format.'
		)
});

const description = `
This endpoint is to provide a capability to query attribute table for a vector layer. Currently, it is not available for raster layer.

\`query\` param is to scan all properties to return any matched features. If you want to filter by specific columns, please use \`cql_filter\` instead.

Use \`cql_filter\` to filter by advanced search. \`cql_filter\` only supports the following operators:

\`EQUAL TO [ = ]\`, \`LESS THAN [ < ]\`, \`LESS THAN OR EQUAL TO [ <= ]\`, \`GREATER THAN [ > ]\`, \`GREATER THAN OR EQUAL TO [ >= ]\`, \`IS NULL\`, \`LIKE\`, \`IN\`, \`NOT IN\`, \`BETWEEN aaa AND bbb\`, \`NOT [ <> ]\`

each condition can be concatenated by either \`AND\`, \`OR\`. operators should be capital letters.

The below are examples of cql_filter for each operator.

- \`type_of_facility = 'Primary School'\`
- \`student_number < 714\`
- \`student_number <= 714\`
- \`student_number > 782\`
- \`student_number >= 782\`
- \`condition IS NULL\`
- \`facility_name LIKE EP\`
- \`type_of_facility IN ('Primary School')\`, \`type_of_facility IN ('Primary School', 'Secondary School')\`
- \`student_number NOT IN (701, 782)\`
- \`student_number BETWEEN 600 AND 800\`, \`student_number BETWEEN 600 AND 800 AND type_of_facility = Secondary school\`
- \`availability <> 'Regularly'\`
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Query attribute table for a layer';
	c.description = description;
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	c.responses = {
		200: {
			description: `
OK

Attribute table data according to the format specifed in query param.

If format is either json or geojson, it returns links and pages properties. If it is csv, it returns text/csv file. If json is selected as format, it omit geometry property from geojson.
            `,
			content: {
				'application/octet-stream': {
					schema: z.string().describe('Attribute table data in xlsx format')
				},
				'text/csv': {
					schema: z.string().describe('Attribute table data in csv format')
				},
				'application/json': {
					schema: z
						.custom<FeatureCollection>()
						.describe(
							'Feature collection of attribute data. If json is selected, geometry property is not included.'
						)
				}
			}
		},
		400: {
			description: `
Bad Request

It returns 400 error in the following conditions:

- If it is a raster layer
- If layer does not exist in vector tiles
- If bbox text does not align with minx, miny, maxx, maxy format
- If format is invalid format
- If limit or offset are not number
- If sortby is wrong format, or specify the wrong field name
            `
		},
		404: {
			description: `
Not Found

It returns 404 error in the following conditions:

- If no dataset exists in the ID specifed
- If no flatgeobuf exists to the dataset
            `
		}
	};
	return c;
};

export default new Endpoint({ Param, Query, Output, Modifier }).handle(
	async (param, { locals, url, fetch }) => {
		// console.time('table');
		const session = await locals.auth();
		const user_email = session?.user.email as string;
		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const id: string = param.id;
		const layer: string = param.layer.toLowerCase();
		const format: string = param.format.toLowerCase();
		if (!SupportedTableFormats.includes(format)) {
			error(400, {
				message: `${format} is not supported. Please select it from ${SupportedTableFormats.join(', ')}`
			});
		}

		const _limit = url.searchParams.get('limit') || 1000;
		const limit = Number(_limit);
		const _offset = url.searchParams.get('offset') || 0;
		const offset = Number(_offset);

		const compress = url.searchParams.get('compress');
		let isCompress = false;
		if (compress === 'true') {
			isCompress = true;
		}
		// console.timeLog('table', 'before getDatasetById');
		const dataset = await getDatasetById(id, is_superuser, user_email);
		if (!dataset) {
			error(404, { message: `No dataset found.` });
		}
		// console.timeLog('table', 'after getDatasetById');
		if (dataset.properties.is_raster === true) {
			error(400, { message: 'The endpoint does not support raster dataset.' });
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
		// console.timeLog('table', 'before createDatasetLinks');
		dataset.properties = await createDatasetLinks(dataset, url.origin, env.TITILER_ENDPOINT);
		// console.timeLog('table', 'after createDatasetLinks');
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
		// console.timeLog('table', fgbUrl.toString());
		const iter = geojson.deserialize(fgbUrl.toString(), rect);
		// console.timeLog('table', 'after geojson.deserialize');
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
			if (feature.id) {
				delete feature.id;
			}
			fc.features.push(feature);
		}
		// console.timeLog('table', fc.features.length);

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
				const targetSortingColumns = tilestats.attributes.map((attr) =>
					attr.attribute.trim().toLowerCase()
				);
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
		SupportedTableFormats.forEach((f) => {
			const downloadUrl = new URL(url.href.replace(`.${format}`, `.${f}`));
			downloadUrl.searchParams.delete('compress');
			links.push({
				rel: f,
				type: 'application/json',
				href: downloadUrl.href
			});
		});
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
		} else {
			if (format === 'json') {
				for (let i = 0; i < fc.features.length; i++) {
					fc.features[i] = {
						type: fc.features[i].type,
						properties: fc.features[i].properties
					} as unknown as Feature;
				}
			}
			const data = JSON.stringify(fc);

			if (!isCompress) {
				return fc;
			} else {
				// https://dev.to/ternentdotdev/json-compression-in-the-browser-with-gzip-and-the-compression-streams-api-4135
				const stream = new Blob([data], {
					type: 'application/json'
				}).stream();

				const compressedReadableStream = stream.pipeThrough(new CompressionStream('gzip'));
				// console.timeEnd('table');
				return compressedReadableStream;
			}
		}
	}
);

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
