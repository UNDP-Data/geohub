import type { PoolClient } from 'pg';

export const getStyleStarCount = async (client: PoolClient, style_id: number) => {
	const query = {
		text: `
        SELECT count(*) as stars
        FROM geohub.style_favourite
        WHERE style_id = $1
        GROUP BY style_id
        `,
		values: [style_id]
	};

	const res = await client.query(query);

	if (res.rowCount === 0) {
		return 0;
	} else {
		return res.rows[0]['stars'];
	}
};
