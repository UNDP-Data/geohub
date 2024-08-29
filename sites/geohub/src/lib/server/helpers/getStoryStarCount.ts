import type { PoolClient } from 'pg';

export const getStoryStarCount = async (client: PoolClient, storymap_id: string) => {
	const query = {
		text: `
        SELECT count(*) as stars
        FROM geohub.storymap_favourite
        WHERE storymap_id = $1
        GROUP BY storymap_id
        `,
		values: [storymap_id]
	};

	const res = await client.query(query);

	if (res.rowCount === 0) {
		return 0;
	} else {
		return res.rows[0]['stars'];
	}
};
