import DatabaseManager from '$lib/server/DatabaseManager';
import type { StatsCard } from '@undp-data/svelte-undp-design';
import { AccessLevel } from '$lib/config/AppConfig';

export const getDatasetStats = async () => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `
			WITH public_datasets AS(
				SELECT a.id as dataset_id, c.id as tag_id, c.key, c.value
				FROM geohub.dataset a
				LEFT JOIN geohub.dataset_tag b
				ON a.id = b.dataset_id
				LEFT JOIN geohub.tag c
				ON b.tag_id = c.id
				WHERE access_level=${AccessLevel.PUBLIC}
				),
				tag_count AS (
				  SELECT z.key, z.value,  COUNT(x.id) as count
				  FROM geohub.dataset x
				  INNER JOIN geohub.dataset_tag y
				  ON x.id = y.dataset_id
				  INNER JOIN geohub.tag z
				  ON y.tag_id = z.id
				  GROUP BY
				  z.key, z.value
			)
			SELECT * FROM(
				SELECT
					1 as id,
					'Public datasets' as title,
					'The number of public datasets' as description, 
					count(x.*) as count 
				FROM (SELECT dataset_id FROM public_datasets GROUP BY dataset_id) x
				UNION
				SELECT
					2 as id,
					'Country datasets' as title,
					'The number of public datasets linked to at least a country' as description,
					count(x.*) as count 
				FROM (SELECT dataset_id FROM public_datasets WHERE key='country' GROUP BY dataset_id) x
				UNION
				SELECT
					3 as id,
					'Global datasets' as title,
					'The number of public global datasets' as description, 
					count(x.*) as count 
				FROM (SELECT dataset_id FROM public_datasets WHERE value='Global' GROUP BY dataset_id) x
				UNION
				SELECT
					4 as id,
					'SDG datasets' as title,
					'The number of public datasets linked to at least a SDG' as description, 
					count(x.*) as count 
				FROM (SELECT dataset_id FROM public_datasets WHERE key='sdg_goal' GROUP BY dataset_id) x
				UNION
				SELECT
					5 as id,
					'Countries' as title,
					'The number of countries having GeoHub datasets' as description, 
					count(x.*) as count 
				FROM (SELECT value FROM tag_count WHERE key='country') x
			) a
			ORDER BY a.id
			`,
			values: []
		};
		const res = await client.query(query);

		const cards: StatsCard[] = [];

		res.rows.forEach((row) => {
			cards.push({
				stat: row.count,
				title: row.title,
				description: row.description
			});
		});

		return cards;
	} finally {
		dbm.end();
	}
};
