import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import {
	createDatasetLinks,
	createDatasetSearchWhereExpression,
	isSuperuser,
	pageNumber
} from '$lib/server/helpers';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { DatasetFeatureCollection, Link, Pages } from '$lib/types';
import { SQL, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

export const Output = z.custom<DatasetFeatureCollection>().describe('dataset feature collection');

export const Query = z.object({
	query: z.string().optional().describe('free text to search in name, description'),
	bbox: z
		.string()
		.optional()
		.describe('you can filter the data by bounding box (minx, miny, maxx, maxy)'),
	limit: z
		.string()
		.optional()
		.default('10')
		.describe('The number of datasets retrieved. default is 10'),
	offset: z.string().optional().default('0').describe('Offset value for paging. default is 0'),
	sortby: z
		.enum([
			'name,asc',
			'name,desc',
			'license,asc',
			'license,desc',
			'createdat,asc',
			'createdat,desc',
			'updatedat,asc',
			'updatedat,desc',
			'no_stars,asc',
			'no_stars,desc'
		])
		.optional()
		.describe('sort by column in asc or desc order'),
	extent: z.string().optional().describe('Search by extent value'),
	granularity: z.string().optional().describe('Search by granularity value'),
	keyword: z.string().optional().describe('Search by keyword value'),
	layertype: z
		.enum(['table', 'function'])
		.optional()
		.describe('Search by layertype of pg_tileserv'),
	resolution: z.string().optional().describe('Search by resolution value'),
	sdg_goal: z
		.enum([
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'10',
			'11',
			'12',
			'13',
			'14',
			'15',
			'16',
			'17'
		])
		.optional()
		.describe('search by sdg_goal value'),
	sdg_target: z.string().optional().describe('search by sdg_target value'),
	stac: z.enum(['earth-search', 'microsoft-pc']).optional().describe('search by stac value'),
	theme: z.string().optional().describe('search by theme value'),
	type: z.enum(['pgtileserv', 'stac']).optional().describe('search by type value'),
	year: z.string().optional().describe('search by year value'),
	staronly: z
		.enum(['true', 'false'])
		.optional()
		.default('false')
		.describe('if true, only search for favourite datasets'),
	queryoperator: z
		.enum(['and', 'or'])
		.optional()
		.default('and')
		.describe(`operator for query search. convert space to either 'and' or 'or'`),
	operator: z.enum(['and', 'or']).optional().default('and').describe(`operator for tag search.`),
	mydata: z
		.enum(['true', 'false'])
		.optional()
		.default('false')
		.describe('if true, only fetch datasets owned by login user'),
	accesslevel: z
		.enum([
			`${AccessLevel.ALL}`,
			`${AccessLevel.PRIVATE}`,
			`${AccessLevel.ORGANIZATION}`,
			`${AccessLevel.PUBLIC}`
		])
		.optional()
		.default(`${AccessLevel.ALL}`)
		.describe('Access Level published to -1: All, 1: login user 2: UNDP 3: public')
});

const description = `
This API returns the result as GeoJSON feature collection format and it contains links property at the bottom.

The links will have the following patterns.

- self = URL for the query itself
- root = URL origin for this API
- next = URL for next page
- previous = URL for previous page

You can use next or previous links to implement paging feature.

Flexiblely to search by key/value of tags.

{key}={value} e.g., sdg_goal=1 to filter where tag key is sdg_goal and value is 1. If multiple key/value are set, it will filter by OR operator. if you want to filter by SDG1 and 2, you can query like '&sdg_goal=1&sdg_goal=2'
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Dataset search API';
	c.description = description;
	c.tags = ['datasets'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No dataset found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Query, Output, Modifier, Error }).handle(
	async (param, { locals, url }) => {
		const session = await locals.auth();
		const user_email = session?.user.email;

		const _limit = param.limit || 10;
		const limit = Number(_limit);
		const _offset = param.offset || 0;
		const offset = Number(_offset);

		const sortby = param.sortby;
		let sortByColumn = 'name';
		let SortOrder: 'asc' | 'desc' = 'asc';
		if (sortby) {
			const values = sortby.split(',');
			const column: string = values[0].trim().toLowerCase();
			const targetSortingColumns = ['name', 'license', 'createdat', 'updatedat', 'no_stars'];
			const targetSortingOrder = ['asc', 'desc'];
			if (!targetSortingColumns.includes(column)) {
				console.log(targetSortingColumns, column);
				error(400, {
					message: `Bad parameter for 'sortby'. It must be one of '${targetSortingColumns.join(
						', '
					)}'`
				});
			}
			sortByColumn = column;
			if (sortByColumn === 'updatedat') {
				sortByColumn = 'COALESCE(updatedat, createdat)';
			}

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

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		const whereExpressesion = await createDatasetSearchWhereExpression(
			url,
			'x',
			is_superuser,
			user_email
		);

		const mainSql = sql.raw(`
			  WITH datasetTags as (
				SELECT
				x.id,
				array_to_json(array_agg(row_to_json((
				  SELECT p FROM (
				  SELECT
					z.key,
					z.value
				  ) AS p
				  )))) AS tags
				FROM geohub.dataset x
				LEFT JOIN geohub.dataset_tag y
				ON x.id = y.dataset_id
				INNER JOIN geohub.tag z
				ON y.tag_id = z.id
				GROUP BY
				  x.id
			  ),
			  no_stars as (
				SELECT dataset_id, count(*) as no_stars FROM geohub.dataset_favourite GROUP BY dataset_id
			  )
			  ${
					!is_superuser && user_email
						? `
			  ,permission as (
				SELECT dataset_id, permission FROM geohub.dataset_permission 
				WHERE user_email='${user_email}'
			  )`
						: ''
				}
			  SELECT row_to_json(featurecollection) AS geojson 
			  FROM (
				SELECT
				  'FeatureCollection' AS type,
				  array_to_json(array_agg(feature)) AS features
				FROM (
				  SELECT
				  'Feature' AS type,
				  ST_AsGeoJSON(ST_TRANSFORM(x.bounds,4326))::json AS geometry,
				  row_to_json((
				  SELECT p FROM (
				  SELECT
					x.id, 
					x.url, 
					x.name,
					x.description,
					x.is_raster, 
					x.license, 
					x.access_level,
					x.createdat, 
					x.created_user,
					CASE WHEN x.updatedat is not null THEN x.updatedat ELSE x.createdat END AS updatedat,
					CASE WHEN x.updated_user is not null THEN x.updated_user ELSE x.created_user END AS updated_user,
					y.tags,
					CASE WHEN z.no_stars is not null THEN z.no_stars ELSE 0 END as no_stars,
					${
						!is_superuser && user_email
							? `CASE WHEN p.permission is not null THEN p.permission ELSE null END`
							: `${is_superuser ? Permission.OWNER : 'null'}`
					} as permission,
					${
						user_email
							? `
					  CASE
						WHEN (
						SELECT count(dataset_id) as count FROM geohub.dataset_favourite 
						WHERE dataset_id=x.id and user_email='${user_email}'
						) > 0 THEN true
						ELSE false
					  END as is_star
					  `
							: 'false as is_star'
					}
				  ) AS p
				  )) AS properties
				  FROM geohub.dataset x
				  LEFT JOIN datasetTags y
				  ON x.id = y.id
				  LEFT JOIN no_stars z
				  ON x.id = z.dataset_id
				  ${
						!is_superuser && user_email
							? `
				  LEFT JOIN permission p
				  ON x.id = p.dataset_id
				  `
							: ''
					}
			  `);

		const sqlChunks: SQL[] = [mainSql];
		if (whereExpressesion) {
			sqlChunks.push(whereExpressesion);
		}

		sqlChunks.push(
			sql.raw(`
				ORDER BY
					${sortByColumn} ${SortOrder} NULLS ${SortOrder === 'asc' ? 'FIRST' : 'LAST'}
					LIMIT ${limit}
					OFFSET ${offset}
					) AS feature
				) AS featurecollection	
			`)
		);

		// console.log(sql);
		const res = await db.execute(sql.join(sqlChunks, sql.raw(' ')));
		const geojson: DatasetFeatureCollection = res[0].geojson as unknown as DatasetFeatureCollection;
		if (!geojson.features) {
			geojson.features = [];
		}

		const nextUrl = new URL(url.toString());
		nextUrl.searchParams.set('limit', limit.toString());
		nextUrl.searchParams.set('offset', (offset + limit).toString());
		const links: Link[] = [
			{
				rel: 'root',
				type: 'application/json',
				href: `${url.origin}${url.pathname}`
			},
			{
				rel: 'self',
				type: 'application/json',
				href: url.toString()
			}
		];

		if (geojson.features.length === limit) {
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

		geojson.links = links;

		const totalCount = await getTotalCount(whereExpressesion);

		let totalPages = Math.ceil(totalCount / Number(limit));
		if (totalPages === 0) {
			totalPages = 1;
		}
		const currentPage = pageNumber(totalCount, Number(limit), Number(offset));
		const pages: Pages = {
			totalCount,
			totalPages,
			currentPage
		};

		if (totalPages === currentPage) {
			// remove next link if it is the last page
			geojson.links = geojson.links.filter((l) => !['next'].includes(l.rel));
		}

		geojson.pages = pages;

		// add SAS token if it is Azure Blob source
		for (const feature of geojson.features) {
			feature.properties = await createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);
		}

		return geojson;
	}
);

const getTotalCount = async (whereSql: SQL) => {
	const sqlChunks: SQL[] = [
		sql.raw(`
		SELECT
		  COUNT(x.id) as count
		FROM geohub.dataset x	
		`)
	];
	sqlChunks.push(whereSql);

	const res = await db.execute(sql.join(sqlChunks, sql.raw(' ')));

	const count = Number(res[0]['count']);
	return count;
};
