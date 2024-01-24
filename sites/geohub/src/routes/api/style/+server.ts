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
import DatabaseManager from '$lib/server/DatabaseManager';
import { getDomainFromEmail } from '$lib/helper';
import { error } from '@sveltejs/kit';
import type { StyleSpecification } from 'maplibre-gl';
import { StylePermissionManager } from '$lib/server/StylePermissionManager.ts';

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
	const session = await locals.getSession();
	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
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

		const where = `
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
    ${query ? 'AND to_tsvector(x.name) @@ to_tsquery($1)' : ''}
	${
		onlyStar && user_email
			? `
			AND EXISTS (
			SELECT style_id FROM geohub.style_favourite WHERE style_id=x.id AND user_email='${user_email}'
			)
			`
			: ''
	}
    `;

		// only can access to
		// access_level = 3
		// or access_lavel = 2 which were created by user with @undp.org email
		// or created_user = login user email
		const sql = {
			text: `
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
			ON x.id = p.style_id
			${where}
			ORDER BY
				${sortByColumn} ${sortOrder} 
			LIMIT ${limit}
			OFFSET ${offset}`,
			values: values
		};

		// console.log(sql);

		const res = await client.query(sql);

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

		if (res.rowCount === Number(limit)) {
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

		const totalCount = await getStyleCount(where, values);
		let totalPages = Math.ceil(totalCount / Number(limit));
		if (totalPages === 0) {
			totalPages = 1;
		}
		const styles: DashboardMapStyle[] = res.rows;
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
	} finally {
		dbm.end();
	}
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
	const session = await locals.getSession();
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
	Object.keys(styleJson.sources).forEach((key) => {
		const source = styleJson.sources[key];
		if ('url' in source && source.url.startsWith(url.origin)) {
			source.url = source.url.replace(url.origin, '');
		} else if ('tiles' in source) {
			source.tiles.forEach((tile) => {
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

	let styleId: number;

	const dbm = new DatabaseManager();
	const client = await dbm.transactionStart();
	try {
		const query = {
			text: `INSERT INTO geohub.style (name, style, layers, access_level, created_user) VALUES ($1, $2, $3, $4, $5) returning id`,
			values: [
				body.name,
				JSON.stringify(styleJson),
				JSON.stringify(body.layers),
				body.access_level,
				session.user.email
			]
		};

		const res = await client.query(query);
		if (res.rowCount === 0) {
			error(500, { message: 'failed to insert to the database.' });
		}
		styleId = res.rows[0].id;

		// add style_permission for created user as owner
		const spm = new StylePermissionManager(styleId, user_email);
		await spm.register(client, {
			style_id: `${styleId}`,
			user_email,
			permission: Permission.OWNER
		});
	} catch (err) {
		await dbm.transactionRollback();
		error(500, err);
	} finally {
		await dbm.transactionEnd();
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
	const session = await locals.getSession();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const body = await request.json();
		if (!body.name) {
			throw new Error('name property is required');
		}
		if (!body.style) {
			throw new Error('style property is required');
		}
		if (!body.layers) {
			throw new Error('layers property is required');
		}
		if (!body.access_level) {
			throw new Error('access_level property is required');
		}
		const id = body.id;

		const user_email = session?.user.email;

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		let style = (await getStyleById(id, url, user_email, is_superuser)) as DashboardMapStyle;

		if (!is_superuser) {
			const email = session?.user?.email;
			// only allow to delete style created by login user it self.
			if (!(email && email === style.created_user)) {
				error(403, { message: 'Permission error' });
			}

			let domain: string;
			if (email) {
				domain = getDomainFromEmail(email);
			}

			const accessLevel: AccessLevel = style.access_level;
			if (accessLevel === AccessLevel.PRIVATE) {
				if (!(email && email === style.created_user)) {
					if (!(style.permission && style.permission >= Permission.READ)) {
						error(403, { message: 'Permission error' });
					}
				}
			} else if (accessLevel === AccessLevel.ORGANIZATION) {
				if (!(domain && style.created_user?.indexOf(domain) > -1)) {
					if (!(style.permission && style.permission >= Permission.READ)) {
						error(403, { message: 'Permission error' });
					}
				}
			}
		}

		const styleJson: StyleSpecification = body.style;
		Object.keys(styleJson.sources).forEach((key) => {
			const source = styleJson.sources[key];
			if ('url' in source && source.url.startsWith(url.origin)) {
				source.url = source.url.replace(url.origin, '');
			} else if ('tiles' in source) {
				source.tiles.forEach((tile) => {
					if (tile.startsWith(url.origin)) {
						tile = tile.replace(url.origin, '');
					}
				});
			}
		});

		const now = new Date().toISOString();
		const query = {
			text: `
      UPDATE geohub.style
      SET name=$1, style=$2, layers=$3, updatedat=$4::timestamptz, access_level=$5, updated_user=$6
      WHERE id=$7`,
			values: [
				body.name,
				JSON.stringify(styleJson),
				JSON.stringify(body.layers),
				now,
				body.access_level,
				session.user.email,
				id
			]
		};

		await client.query(query);

		style = (await getStyleById(id, url, session?.user?.email, is_superuser)) as DashboardMapStyle;
		return new Response(JSON.stringify(style));
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	} finally {
		dbm.end();
	}
};
