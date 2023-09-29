import type { RequestHandler } from './$types';
import type { DashboardMapStyle, Pages, StacLink } from '$lib/types';
import { getStyleById, getStyleCount, pageNumber } from '$lib/server/helpers';
import { AccessLevel } from '$lib/config/AppConfig';
import DatabaseManager from '$lib/server/DatabaseManager';
import { getDomainFromEmail } from '$lib/helper';

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

		const where = `
    WHERE (
      x.access_level = ${AccessLevel.PUBLIC} 
      ${
				domain
					? `OR (x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}')`
					: ''
			}
      ${email ? `OR (x.created_user = '${email}')` : ''}
    )
    ${
			accessLevel === AccessLevel.PRIVATE
				? `AND (x.created_user = '${email}')`
				: accessLevel === AccessLevel.ORGANIZATION
				? `AND (x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}')`
				: `AND x.access_level = ${AccessLevel.PUBLIC}`
		}
    ${query ? 'AND to_tsvector(x.name) @@ to_tsquery($1)' : ''}
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
						END as is_star
						`
						: 'false as is_star'
				}
			FROM geohub.style x
			LEFT JOIN no_stars z
          	ON x.id = z.style_id
			${where}
			ORDER BY
				${sortByColumn} ${sortOrder} 
			LIMIT ${limit}
			OFFSET ${offset}`,
			values: values
		};

		const res = await client.query(sql);

		const nextUrl = new URL(url.toString());
		nextUrl.searchParams.set('limit', limit);
		nextUrl.searchParams.set('offset', (Number(offset) + Number(limit)).toString());

		const links: StacLink[] = [
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
			s.links = [
				{
					rel: 'root',
					type: 'application/json',
					href: `${url.origin}${url.pathname}`
				},
				{
					rel: 'self',
					type: 'application/json',
					href: `${url.origin}${url.pathname}/${s.id}`
				},
				{
					rel: 'map',
					type: 'text/html',
					href: `${url.origin}/map/${s.id}`
				},
				{
					rel: 'stylejson',
					type: 'application/json',
					href: `${url.origin}${url.pathname}/${s.id}.json`
				}
			];
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
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
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

		const query = {
			text: `INSERT INTO geohub.style (name, style, layers, access_level, created_user) VALUES ($1, $2, $3, $4, $5) returning id`,
			values: [
				body.name,
				JSON.stringify(body.style),
				JSON.stringify(body.layers),
				body.access_level,
				session.user.email
			]
		};

		const res = await client.query(query);
		if (res.rowCount === 0) {
			throw new Error('failed to insert to the database.');
		}
		const id = res.rows[0].id;
		const is_superuser = session?.user?.is_superuser ?? false;
		const style = await getStyleById(id, url, session?.user?.email, is_superuser);

		return new Response(JSON.stringify(style));
	} catch (err) {
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400
		});
	} finally {
		dbm.end();
	}
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
		return new Response(JSON.stringify({ message: 'Permission error' }), {
			status: 403
		});
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

		const is_superuser = session?.user?.is_superuser ?? false;
		let style = (await getStyleById(
			id,
			url,
			session?.user?.email,
			is_superuser
		)) as DashboardMapStyle;
		const email = session?.user?.email;
		// only allow to delete style created by login user it self.
		if (!(email && email === style.created_user)) {
			return new Response(JSON.stringify({ message: 'Permission error' }), {
				status: 403
			});
		}

		const now = new Date().toISOString();
		const query = {
			text: `
      UPDATE geohub.style
      SET name=$1, style=$2, layers=$3, updatedat=$4::timestamptz, access_level=$5, updated_user=$6
      WHERE id=$7`,
			values: [
				body.name,
				JSON.stringify(body.style),
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
