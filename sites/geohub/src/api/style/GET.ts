import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import { db } from '$lib/server/db';
import { SQL, sql } from 'drizzle-orm';
import type { DashboardMapStyle, Link, Pages } from '$lib/types';
import { pageNumber } from '$lib/server/helpers/pageNumber';
import { createStyleLinks } from '$lib/server/helpers/createStyleLinks';
import { getStyleCount } from '$lib/server/helpers/getStyleCount';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error } from '@sveltejs/kit';

export const Output = z
	.object({
		styles: z.custom<DashboardMapStyle[]>(),
		links: z.custom<Link[]>(),
		pages: z.custom<Pages>()
	})
	.describe('Style searching result');

export const Query = z.object({
	query: z.string().optional().describe('text to search styles by name'),
	limit: z
		.string()
		.optional()
		.default('10')
		.describe('The number of datasets retrieved. default is 10'),
	sortby: z
		.string()
		.optional()
		.default('updatedat, desc')
		.describe(
			`sorting column and sorting order. e.g., 'updatedat, desc'. if asc or desc is skipped, asc will be used.`
		),
	offset: z.string().optional().default('0').describe('Offset value for paging. default is 0'),
	accesslevel: z
		.enum([
			`${AccessLevel.ALL}`,
			`${AccessLevel.PRIVATE}`,
			`${AccessLevel.ORGANIZATION}`,
			`${AccessLevel.PUBLIC}`
		])
		.optional()
		.default(`${AccessLevel.PRIVATE}`)
		.describe('Access Level published to -1: All, 1: login user 2: UNDP 3: public'),
	staronly: z
		.string()
		.optional()
		.default('false')
		.describe('if true, only search for favourite styles'),
	mydata: z
		.string()
		.optional()
		.default('false')
		.describe(`If true, only search for maps which users own. Default is false`)
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Style list API';
	c.description = 'Get the list of saved style from PostGIS database';
	c.tags = ['style'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Query, Output, Modifier }).handle(async (param, { url, locals }) => {
	const session = await locals.auth();
	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const limit = param.limit ?? '10';
	const offset = param.offset ?? '0';
	const accessLevel = Number(param.accesslevel ?? `${AccessLevel.ALL}`) as AccessLevel;

	const sortby = param.sortby;
	let sortByColumn = 'name';
	let sortOrder: 'asc' | 'desc' = 'asc';
	if (sortby) {
		const values = sortby.split(',');
		const column: string = values[0].trim().toLowerCase();
		const targetSortingColumns = ['id', 'name', 'createdat', 'updatedat', 'no_stars'];
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
			sortOrder = order as 'asc' | 'desc';
		}
	}

	let query = param.query;

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
	let domain = '';
	if (email) {
		domain = getDomainFromEmail(email);
	}

	const _onlyStar = param.staronly || 'false';
	const onlyStar = _onlyStar.toLowerCase() === 'true';

	const _onlyMydata = param.mydata || 'false';
	const mydataOnly = _onlyMydata.toLowerCase() === 'true';

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

	const whereChunks: SQL[] = [sql.raw(`WHERE`)];
	if (!user_email) {
		whereChunks.push(sql.raw(`x.access_level = ${AccessLevel.PUBLIC}`));
	} else {
		if (accessLevel === AccessLevel.PUBLIC) {
			whereChunks.push(sql.raw(`x.access_level = ${AccessLevel.PUBLIC}`));
		} else if (accessLevel === AccessLevel.ORGANIZATION) {
			if (domain) {
				whereChunks.push(
					sql.raw(`
					(
						x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}'
						OR (
							x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}'
							AND
							EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
						)
					)
					`)
				);
			}
		} else if (accessLevel === AccessLevel.PRIVATE) {
			whereChunks.push(
				sql.raw(`
					(
						x.access_level = ${AccessLevel.PRIVATE}
						AND
						EXISTS (SELECT style_id FROM geohub.style_permission WHERE style_id = x.id AND user_email='${email}'
						)
					OR EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
					)
				`)
			);
		} else {
			whereChunks.push(
				sql.raw(`
				(x.access_level = ${AccessLevel.PUBLIC}
				${
					domain
						? `OR (
							x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}'
							OR (
								x.access_level = ${AccessLevel.ORGANIZATION} AND x.created_user LIKE '%${domain}'
								AND
								EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
							)
						)`
						: ''
				}
					OR (
						(
							x.access_level = ${AccessLevel.PRIVATE}
							AND
							EXISTS (SELECT style_id FROM geohub.style_permission WHERE style_id = x.id AND user_email='${email}'
						)
						OR EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
					)
				))
				`)
			);
		}
	}

	if (query) {
		whereChunks.push(sql.raw(`AND to_tsvector(x.name) @@ to_tsquery('${query}')`));
	}

	if (onlyStar && user_email) {
		whereChunks.push(
			sql.raw(`
			AND EXISTS (
			SELECT style_id FROM geohub.style_favourite WHERE style_id=x.id AND user_email='${user_email}'
			)
			`)
		);
	}

	if (user_email && mydataOnly) {
		whereChunks.push(
			sql.raw(
				`AND EXISTS (SELECT style_id FROM geohub.style_permission WHERE style_id = x.id AND user_email = '${user_email}' AND permission >= ${Permission.READ} )`
			)
		);
	}

	if (whereChunks.length > 1) {
		sqlChunks.push(...whereChunks);
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

	const totalCount = await getStyleCount(sql.join(whereChunks, sql.raw(' ')));
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

	return { styles, links, pages };
});
