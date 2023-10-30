import type { PoolClient } from 'pg';

export const getDatasetStarCount = async (client: PoolClient, dataset_id: string) => {
	const query = {
		text: `
        SELECT count(*) as stars
        FROM geohub.dataset_favourite
        WHERE dataset_id = $1
        GROUP BY dataset_id
        `,
		values: [dataset_id]
	};

	const res = await client.query(query);

	if (res.rowCount === 0) {
		return 0;
	} else {
		return res.rows[0]['stars'];
	}
};
