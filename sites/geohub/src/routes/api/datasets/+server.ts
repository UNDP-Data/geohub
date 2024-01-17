import type { RequestHandler } from './$types';
import type { PoolClient } from 'pg';
import type { DatasetFeatureCollection, Pages, Link, DatasetFeature, Tag } from '$lib/types';
import { createDatasetSearchWhereExpression } from '$lib/server/helpers/createDatasetSearchWhereExpression';
import {
	createDatasetLinks,
	pageNumber,
	isSuperuser,
	upsertDataset,
	generateAzureBlobSasToken,
	getDatasetById
} from '$lib/server/helpers';
import DatabaseManager from '$lib/server/DatabaseManager';
import { Permission } from '$lib/config/AppConfig';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { removeSasTokenFromDatasetUrl } from '$lib/helper';

/**
 * Datasets search API
 * Example
 * http://localhost:5173/api/datasets?limit=10&offset=0&sdg_goal=1&query=kenya&bbox=35.26,-1.058,40.473,1.968&storage_id=4019fd03c7cc612686a6db0fde231206
 * Query Params
 * - query = free text to search in `name`, `description` and `tag value`.
 *     AND search is `aaa and bbb`
 *     OR search is `aaa or bbb`
 *     If queried text contains space like 'water quality', query='water quality' should be used with single quatation.
 * - bbox = you can filter the data by bounding box (minx, miny, maxx, maxy)
 * - sortby = set parameter like "sortby=name, desc". support sorting by 'name', 'source', 'license', 'createdat', 'updatedat'. Default order is ASC.
 * - limit = default is 10
 * - offset = default is 0
 * - {key}={value} e.g., sdg_goal=1 to filter where tag key is `sdg_goal` and value is 1. If multiple key/value are set, it will filter by OR operator.
 *   if you want to filter by SDG1 and 2, you can query like '&sdg_goal=1&sdg_goal=2'
 * - operator = 'and' or 'or'. This operator can be applied for tag search of {key}={value}
 * @returns GeojSON FeatureCollection
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.getSession();
	const user_email = session?.user.email;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const _limit = url.searchParams.get('limit') || 10;
		const limit = Number(_limit);
		const _offset = url.searchParams.get('offset') || 0;
		const offset = Number(_offset);

		const sortby = url.searchParams.get('sortby');
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
		const values = whereExpressesion.values;

		const sql = {
			text: `
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
            x.updatedat,
            x.updated_user,
            y.tags,
            CASE WHEN z.no_stars is not null THEN z.no_stars ELSE 0 END as no_stars,
            ${
							!is_superuser && user_email
								? `CASE WHEN p.permission is not null THEN p.permission ELSE null END`
								: `${
										is_superuser
											? Permission.OWNER
											: 'CASE WHEN p.permission is not null THEN p.permission ELSE null END'
									}`
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
        ${whereExpressesion.sql}
        ORDER BY
          ${sortByColumn} ${SortOrder} NULLS ${SortOrder === 'asc' ? 'FIRST' : 'LAST'}
        LIMIT ${limit}
        OFFSET ${offset}
        ) AS feature
      ) AS featurecollection
      `,
			values: values
		};
		// console.log(sql);
		const res = await client.query(sql);
		const geojson: DatasetFeatureCollection = res.rows[0].geojson;
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

		const totalCount = await getTotalCount(client, whereExpressesion.sql, values);

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
		geojson.features.forEach((feature) => {
			feature.properties = createDatasetLinks(feature, url.origin, env.TITILER_ENDPOINT);
		});

		return new Response(JSON.stringify(geojson));
	} catch (err) {
		error(400, err);
	} finally {
		dbm.end();
	}
};

export const POST: RequestHandler = async ({ fetch, locals, request }) => {
	const session = await locals.getSession();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const body: DatasetFeature = await request.json();
	if (!body.properties.id) {
		error(400, { message: 'id property is required' });
	}
	if (!body.properties.name) {
		error(400, { message: 'name property is required' });
	}
	if (!body.properties.url) {
		error(400, { message: 'url property is required' });
	}
	if (!body.properties.license) {
		error(400, { message: 'license property is required' });
	}
	if (!body.properties.description) {
		error(400, { message: 'description property is required' });
	}

	const tags: Tag[] = body.properties.tags;

	if (tags.filter((t) => t.key === 'provider').length === 0) {
		error(400, 'Data provider is required');
	}

	const now = new Date().toISOString();
	if (!body.properties.created_user) {
		body.properties.created_user = user_email;
		body.properties.createdat = now;
	}
	body.properties.updated_user = user_email;
	body.properties.updatedat = now;

	// delete SAS token from URL
	body.properties.url = removeSasTokenFromDatasetUrl(body.properties.url);
	body.properties.url = decodeURI(body.properties.url);

	await upsertDataset(body);

	// if the dataset is under data-upload storage account, delete .ingesting file after registering metadata
	const azaccount = env.AZURE_STORAGE_ACCOUNT_UPLOAD;
	if (body.properties.url.indexOf(azaccount) > -1) {
		const ingestingFileUrl = `${body.properties.url.replace('pmtiles://', '')}.ingesting`;
		const ingestingUrlWithSasUrl = `${ingestingFileUrl}${generateAzureBlobSasToken(
			ingestingFileUrl,
			60000,
			'rwd'
		)}`;
		const res = await fetch(ingestingUrlWithSasUrl);
		if (res.ok) {
			// if exists, delete file
			const resDelete = await fetch(ingestingUrlWithSasUrl, {
				method: 'DELETE'
			});
			if (resDelete.ok) {
				console.debug(`Deleted ${ingestingUrlWithSasUrl}`);
			}
		}
	}

	const dbm = new DatabaseManager();
	let dataset: DatasetFeature;
	try {
		const client = await dbm.start();
		dataset = await getDatasetById(client, body.properties.id, is_superuser, user_email);
	} finally {
		await dbm.end();
	}
	return new Response(JSON.stringify(dataset));
};

const getTotalCount = async (client: PoolClient, whereSql: string, values: string[]) => {
	const sql = {
		text: `
        SELECT
          COUNT(x.id) as count
        FROM geohub.dataset x
      ${whereSql}
    `,
		values: values
	};
	const res = await client.query(sql);
	const count = Number(res.rows[0]['count']);
	return count;
};
