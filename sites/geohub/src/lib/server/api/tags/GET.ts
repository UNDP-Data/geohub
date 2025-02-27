import { db } from '$lib/server/db';
import { SQL, sql } from 'drizzle-orm';
import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import type { Tag } from '$lib/types';
import { createDatasetSearchWhereExpression } from '$lib/server/helpers/createDatasetSearchWhereExpression';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';

export const Query = z.object({
	key: z
		.enum([
			'extent',
			'granularity',
			'keyword',
			'layertype',
			'resolution',
			'schema',
			'sdg_goal',
			'sdg_target',
			'stac',
			'theme',
			'type',
			'year'
		])
		.optional()
		.describe('Optional parameter to filter by key'),
	url: z
		.string()
		.optional()
		.describe('pass dataset query url to return tags with the same filtering conditions')
		.openapi({
			examples: [
				'https://geohub.data.undp.org/api/datasets?query=narok&staronly=false&queryoperator=and&operator=and&mydata=false'
			]
		})
});

export const Output = z
	.custom<{ [key: string]: Tag[] }>()
	.describe('the list of available tags')
	.openapi({
		example: {
			extent: [
				{
					key: 'extent',
					value: 'Global',
					count: 4219
				}
			]
		}
	});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Search tags';
	c.description = `This API can return the list of available tags. If you simply query by /tags, it returns all tags. You can also filter a key value to list available tags.`;
	c.tags = ['tags'];
	return c;
};

export default new Endpoint({ Query, Output, Modifier }).handle(async (param, { locals }) => {
	const session = await locals.auth();
	const user_email = session?.user.email;

	const key = param.key;
	const currentQueryUrl = param.url;

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
		return {};
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

	return result;
});
