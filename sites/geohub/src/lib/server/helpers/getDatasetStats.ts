import type { StatsCard } from '@undp-data/svelte-undp-design';
import { AccessLevel } from '$lib/config/AppConfig';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { datasetInGeohub, datasetTagInGeohub, tagInGeohub } from '../schema';

export const getDatasetStats = async () => {
	const result = await db.execute(sql`
	WITH public_datasets AS(
		SELECT${datasetInGeohub.id} as dataset_id, ${tagInGeohub.id} as tag_id,${tagInGeohub.key}, ${tagInGeohub.value}
		FROM ${datasetInGeohub}
		LEFT JOIN ${datasetTagInGeohub}
		ON ${datasetInGeohub.id} = ${datasetTagInGeohub.datasetId}
		LEFT JOIN ${tagInGeohub}
		ON ${datasetTagInGeohub.tagId} = ${tagInGeohub.id}
		WHERE ${datasetInGeohub.accessLevel}=${AccessLevel.PUBLIC}
		),
		tag_count AS (
			SELECT ${tagInGeohub.key},  ${tagInGeohub.value},  COUNT(${datasetInGeohub.id}) as count
			FROM ${datasetInGeohub}
			INNER JOIN ${datasetTagInGeohub}
			ON ${datasetInGeohub.id} = ${datasetTagInGeohub.datasetId}
			INNER JOIN ${tagInGeohub}
			ON ${datasetTagInGeohub.tagId} = ${tagInGeohub.id}
			GROUP BY
			${tagInGeohub.key},  ${tagInGeohub.value}
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
			'Global datasets' as title,
			'The number of public global datasets' as description, 
			count(x.*) as count 
		FROM (SELECT dataset_id FROM public_datasets WHERE value='Global' GROUP BY dataset_id) x
		UNION
		SELECT
			3 as id,
			'SDG datasets' as title,
			'We have datasets across all SDGs' as description, 
			count(x.*) as count 
		FROM (SELECT dataset_id FROM public_datasets WHERE key='sdg_goal' GROUP BY dataset_id) x
		UNION
		SELECT
			4 as id,
			'Country datasets' as title,
			'The number of public datasets linked to at least a country' as description,
			count(x.*) as count 
		FROM (SELECT dataset_id FROM public_datasets WHERE key='country' GROUP BY dataset_id) x
		UNION
		SELECT
			5 as id,
			'Countries' as title,
			'The number of countries having GeoHub datasets' as description, 
			count(x.*) as count 
		FROM (SELECT value FROM tag_count WHERE key='country') x
	) a
	ORDER BY a.id
	`);

	const cards: StatsCard[] = [];

	for (const row of result) {
		const data = row as { id: string; title: string; description: string; count: string };
		cards.push({
			stat: Number(data.count),
			title: data.title,
			description: data.description
		});
	}

	return cards;
};
