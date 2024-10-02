import type { RequestHandler } from './$types';
import type { DashboardMapStyle, Pages, Link } from '$lib/types';
import {
	getStyleById,
	getStyleCount,
	pageNumber,
	createStyleLinks,
	isSuperuser
} from '$lib/server/helpers';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { error } from '@sveltejs/kit';
import type { StyleSpecification } from 'maplibre-gl';
import { StylePermissionManager } from '$lib/server/StylePermissionManager.ts';
import { db, type TransactionSchema } from '$lib/server/db';
import { styleInGeohub } from '$lib/server/schema';
import { eq, SQL, sql } from 'drizzle-orm';

/**
 * Get the list of saved style from PostGIS database
 * GET: ./api/style?limit=5&offset=10
 * [
 *   {
 *     "id": 1,
 *     "name": "UNDP GeoHub style",
 *     "createdat": "2022-07-29T15:59:23.781Z",
 *     "style": "http://localhost:3000/api/style/1.json",
 *     "viewer": "http://localhost:3000/viewer?style=http://localhost:3000/api/style/1.json"
 *   }
 * ]
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.auth();
	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const limit = url.searchParams.get('limit') ?? '10';
	const offset = url.searchParams.get('offset') ?? '0';
	const accessLevel = Number(url.searchParams.get('accesslevel') ?? '1');

	const sortby = url.searchParams.get('sortby');
	let sortByColumn = 'name';
	let sortOrder: 'asc' | 'desc' = 'asc';
	if (sortby) {
		const values = sortby.split(',');
		const column: string = values[0].trim().toLowerCase();
		const targetSortingColumns = ['id', 'name', 'createdat', 'updatedat', 'no_stars'];
		const targetSortingOrder = ['asc', 'desc'];
		if (!targetSortingColumns.includes(column)) {
			return new Response(
				JSON.stringify({
					message: `Bad parameter for 'sortby'. It must be one of '${targetSortingColumns.join(
						', '
					)}'`
				}),
				{
					status: 400
				}
			);
		}
		sortByColumn = column;

		if (values.length > 1) {
			const order: string = values[1].trim().toLowerCase();
			if (!targetSortingOrder.includes(order)) {
				return new Response(
					JSON.stringify({
						message: `Bad parameter for 'sortby'. Sorting order must be one of '${targetSortingOrder.join(
							', '
						)}'`
					}),
					{
						status: 400
					}
				);
			}
			sortOrder = order as 'asc' | 'desc';
		}
	}

	let query = url.searchParams.get('query');

	const values = [];
	if (query) {
		// normalise query text for to_tsquery function
		query = query
			.toLowerCase()
			.replace(/\r?\s+and\s+/g, ' & ') // convert 'and' to '&'
			.replace(/\r?\s+or\s+/g, ' | '); // convert 'or' to '|'
		values.push(query);
	}

	const email = session?.user?.email;
	let domain: string;
	if (email) {
		domain = getDomainFromEmail(email);
	}

	const _onlyStar = url.searchParams.get('staronly') || 'false';
	const onlyStar = _onlyStar.toLowerCase() === 'true';

	const _onlyMydata = url.searchParams.get('mydata') || 'false';
	const mydataOnly = _onlyMydata.toLowerCase() === 'true';

	const where = sql.raw(`
    WHERE (

		${accessLevel === AccessLevel.PUBLIC ? `x.access_level = ${AccessLevel.PUBLIC}` : ''}
		${
			accessLevel === AccessLevel.ORGANIZATION
				? `
			${
				domain
					? `(x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}')`
					: ''
			}
		`
				: ''
		}
		${
			accessLevel === AccessLevel.PRIVATE
				? `
		x.access_level = ${AccessLevel.PUBLIC}
		${
			domain
				? `OR (
					x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}'
					OR (
						x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}'
						AND 
						EXISTS (SELECT id FROM geohub.superuser WHERE user_email='${email}')
					)
				)`
				: ''
		}
		${
			email
				? `OR (
					x.created_user = '${email}' 
					OR EXISTS (SELECT style_id FROM geohub.style_permission WHERE style_id = x.id AND user_email='${email}')
					OR EXISTS (SELECT id FROM geohub.superuser WHERE user_email='${email}')
				)`
				: ''
		}
		`
				: ''
		}
      
    )
    ${query ? `AND to_tsvector(x.name) @@ to_tsquery('${query}')` : ''}
	${
		onlyStar && user_email
			? `
			AND EXISTS (
			SELECT style_id FROM geohub.style_favourite WHERE style_id=x.id AND user_email='${user_email}'
			)
			`
			: ''
	}
	${
		user_email && mydataOnly
			? `
AND EXISTS (SELECT style_id FROM geohub.style_permission WHERE style_id = x.id AND user_email = '${user_email}' AND permission >= ${Permission.READ} )`
			: ''
	}
    `);

	// only can access to
	// access_level = 3
	// or access_lavel = 2 which were created by user with @undp.org email
	// or created_user = login user email
	const mainSql = sql.raw(`
			with no_stars as (
				SELECT style_id, count(*) as no_stars FROM geohub.style_favourite GROUP BY style_id
			)
			,permission as (
				SELECT style_id, permission FROM geohub.style_permission 
				WHERE user_email='${user_email}'
			)
			SELECT
				x.id, 
				x.name, 
				x.access_level,
				x.createdat,
				x.created_user, 
				x.updatedat,
				x.updated_user,
				CASE WHEN z.no_stars is not null THEN cast(z.no_stars as integer) ELSE 0 END as no_stars,
				${
					user_email
						? `
						CASE
							WHEN (
							SELECT count(style_id) as count FROM geohub.style_favourite 
							WHERE style_id=x.id and user_email='${user_email}'
							) > 0 THEN true
							ELSE false
						END as is_star,
						`
						: 'false as is_star,'
				}
				${
					!is_superuser && user_email
						? `CASE WHEN p.permission is not null THEN p.permission ELSE null END`
						: `${
								is_superuser
									? Permission.OWNER
									: 'CASE WHEN p.permission is not null THEN p.permission ELSE null END'
							}`
				} as permission
			FROM geohub.style x
			LEFT JOIN no_stars z
          	ON x.id = z.style_id
			LEFT JOIN permission p
			ON x.id = p.style_id`);

	const sqlChunks: SQL[] = [mainSql];
	if (where) {
		sqlChunks.push(where);
	}
	sqlChunks.push(
		sql.raw(`
		ORDER BY
			${sortByColumn} ${sortOrder} 
		LIMIT ${limit}
		OFFSET ${offset}
	`)
	);
	const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));

	const styles: DashboardMapStyle[] = (await db.execute(
		finalSql
	)) as unknown as DashboardMapStyle[];

	const nextUrl = new URL(url.toString());
	nextUrl.searchParams.set('limit', limit);
	nextUrl.searchParams.set('offset', (Number(offset) + Number(limit)).toString());

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

	if (styles.length === Number(limit)) {
		links.push({
			rel: 'next',
			type: 'application/json',
			href: nextUrl.toString()
		});
	}

	if (Number(offset) > 0) {
		const previoustUrl = new URL(url.toString());
		previoustUrl.searchParams.set('limit', limit.toString());
		previoustUrl.searchParams.set('offset', (Number(offset) - Number(limit)).toString());

		links.push({
			rel: 'previous',
			type: 'application/json',
			href: previoustUrl.toString()
		});
	}

	const totalCount = await getStyleCount(where);
	let totalPages = Math.ceil(totalCount / Number(limit));
	if (totalPages === 0) {
		totalPages = 1;
	}
	styles.forEach((s) => {
		s.links = createStyleLinks(s, url);
	});

	const currentPage = pageNumber(totalCount, Number(limit), Number(offset));
	const pages: Pages = {
		totalCount,
		totalPages,
		currentPage
	};

	return new Response(JSON.stringify({ styles, links, pages }));
};

/**
 * Save style.json to PostgreSQL database
 * POST: ./style
 * body = {
 *   name: [style name]
 *   style: [style.json]
 *   layers: json
 * }
 */
export const POST: RequestHandler = async ({ request, url, locals }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const body = await request.json();
	if (!body.name) {
		error(500, { message: 'name property is required' });
	}
	if (!body.style) {
		error(400, { message: 'style property is required' });
	}
	if (!body.layers) {
		error(400, { message: 'layers property is required' });
	}
	if (!body.access_level) {
		error(400, { message: 'access_level property is required' });
	}

	const styleJson: StyleSpecification = body.style;

	// delete sky
	if ('sky' in styleJson) {
		delete styleJson.sky;
	}

	Object.keys(styleJson.sources).forEach((key) => {
		const source = styleJson.sources[key];
		if ('url' in source && source.url?.startsWith(url.origin)) {
			source.url = source.url.replace(url.origin, '');
		} else if ('tiles' in source) {
			source.tiles?.forEach((tile) => {
				if (tile.startsWith(url.origin)) {
					tile = tile.replace(url.origin, '');
				}
			});
		}
	});

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	let styleId: number | undefined;
	await db.transaction(async (tx) => {
		const res = await tx
			.insert(styleInGeohub)
			.values({
				name: body.name,
				style: styleJson,
				layers: body.layers,
				accessLevel: body.access_level,
				createdUser: session.user.email
			})
			.returning({ id: styleInGeohub.id });

		if (res.length === 0) {
			error(500, { message: 'failed to insert to the database.' });
		}
		styleId = res[0].id;

		// add style_permission for created user as owner
		const spm = new StylePermissionManager(styleId, user_email);
		await spm.register(
			{
				style_id: `${styleId}`,
				user_email,
				permission: Permission.OWNER
			},
			tx as TransactionSchema
		);
	});
	if (!styleId) {
		error(500, { message: 'failed to save style.' });
	}
	const style = await getStyleById(styleId, url, user_email, is_superuser);
	return new Response(JSON.stringify(style));
};

/**
 * Save style.json to PostgreSQL database
 * PUT: ./style
 * body = {
 *   id: number
 *   name: [style name]
 *   style: [style.json]
 *   layers: json
 * }
 */
export const PUT: RequestHandler = async ({ request, url, locals }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}

	const body = await request.json();
	if (!body.name) {
		error(400, { message: 'name property is required' });
	}
	if (!body.style) {
		error(400, { message: 'style property is required' });
	}
	if (!body.layers) {
		error(400, { message: 'layers property is required' });
	}
	if (!body.access_level) {
		error(400, { message: 'access_level property is required' });
	}

	const id = body.id;

	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	let style = (await getStyleById(id, url, user_email, is_superuser)) as DashboardMapStyle;

	if (!is_superuser) {
		// not allow to edit if don't have write/owner permission
		if (!(style.permission && style.permission >= Permission.WRITE)) {
			error(403, { message: 'Permission error. Needs WRITE/OWNER permission to edit style.' });
		}
	}

	const styleJson: StyleSpecification = body.style;

	// delete sky
	if ('sky' in styleJson) {
		delete styleJson.sky;
	}

	Object.keys(styleJson.sources).forEach((key) => {
		const source = styleJson.sources[key];
		if ('url' in source && source.url?.startsWith(url.origin)) {
			source.url = source.url.replace(url.origin, '');
		} else if ('tiles' in source) {
			source.tiles?.forEach((tile) => {
				if (tile.startsWith(url.origin)) {
					tile = tile.replace(url.origin, '');
				}
			});
		}
	});

	const now = new Date().toISOString();

	const res = await db
		.update(styleInGeohub)
		.set({
			name: body.name,
			style: styleJson,
			layers: body.layers,
			accessLevel: body.access_level,
			updatedUser: session.user.email,
			updatedat: now
		})
		.where(eq(styleInGeohub.id, id))
		.returning({ id: styleInGeohub.id });

	const styleId = res[0].id;

	style = (await getStyleById(
		styleId,
		url,
		session?.user?.email,
		is_superuser
	)) as DashboardMapStyle;
	return new Response(JSON.stringify(style));
};
