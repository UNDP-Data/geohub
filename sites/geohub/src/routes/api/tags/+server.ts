import type { RequestHandler } from './$types';
import type { Tag } from '$lib/types/Tag';
import { createDatasetSearchWhereExpression, isSuperuser } from '$lib/server/helpers';
import { sql, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';

/**
 * Tags API - return available keys and values in tag table
 * Example
 * http://localhost:5173/api/tags?url=http://localhost:5173/api/datasets?stac=microsoft-pc&sortby=name%2Casc&limit=25
 * Query Params
 * - key = only filter by key name. if it is not specified, all values will be returned
 * - url = URL used for dataset search to filter available tags
 * @returns the list of key and value in tag table
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.auth();
	const user_email = session?.user.email;

	const key = url.searchParams.get('key');
	const currentQueryUrl = url.searchParams.get('url');

	let whereSql: SQL | undefined = undefined;
	if (currentQueryUrl) {
		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}
		whereSql = await createDatasetSearchWhereExpression(
			new URL(currentQueryUrl),
			'x',
			is_superuser,
			user_email
		);
	}

	const sqlChunks: SQL[] = [];
	sqlChunks.push(
		sql.raw(`
		WITH tag_count AS (
		SELECT z.key, z.value,  COUNT(x.id) as count
		FROM geohub.dataset x
		INNER JOIN geohub.dataset_tag y
		ON x.id = y.dataset_id
		INNER JOIN geohub.tag z
		ON y.tag_id = z.id
		`)
	);
	if (whereSql) {
		sqlChunks.push(whereSql);
	}

	sqlChunks.push(
		sql.raw(`
		GROUP BY
		z.key, z.value
		)
		SELECT distinct x.key, x.value, y.count
		FROM geohub.tag x
		INNER JOIN tag_count y
		ON x.key = y.key
		AND x.value = y.value
		WHERE EXISTS (SELECT id FROM geohub.dataset_tag WHERE tag_id = x.id)
		${
			!key
				? ''
				: `
		AND x.key = '${key}'
		`
		}
		ORDER BY x.key, x.value	
		`)
	);

	const res: Tag[] = (await db.execute(sql.join(sqlChunks, sql.raw(' ')))) as unknown as Tag[];

	// const res = await client.query(sql);
	if (res.length === 0) {
		return new Response(JSON.stringify({}));
	}

	const result: { [key: string]: Tag[] } = {};
	res.forEach((row) => {
		if (!row.key) {
			return;
		}
		if (!result[row.key]) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			result[row.key] = [];
		}
		result[row.key].push({
			key: row.key,
			value: row.value,
			count: Number(row.count)
		});
	});

	return new Response(JSON.stringify(result));
};
