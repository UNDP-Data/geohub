import type { PoolClient } from 'pg';
import type { StatsCard } from '@undp-data/svelte-undp-design';
import { AccessLevel } from '$lib/config/AppConfig';
import DatabaseManager from '$lib/server/DatabaseManager';

/**
 * Get the total count of styles stored in database
 * GET: ./api/style/count
 */
export const getMapStats = async () => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `
        SELECT
            access_level, 
            count(*) as count
        FROM geohub.style
        GROUP BY access_level
        ORDER BY access_level desc
      `,
			values: []
		};

		const res = await client.query(query);

		const cards: StatsCard[] = [];

		res.rows.forEach((row) => {
			const stat = row.count;
			let title = '';
			let description = '';
			if (row.access_level === AccessLevel.PRIVATE) {
				title = 'Private Maps';
				description = `${stat} maps created privately`;
			} else if (row.access_level === AccessLevel.ORGANIZATION) {
				title = 'Maps shared in UNDP';
				description = `${stat} maps created and shared within UNDP`;
			} else {
				title = 'Public Maps created';
				description = `${stat} maps shared by community`;
			}

			cards.push({
				stat,
				title,
				description
			});
		});

		const userstats = await getUserStats(client);
		cards.push(userstats);
		return cards;
	} finally {
		dbm.end();
	}
};

const getUserStats = async (client: PoolClient) => {
	const query = {
		text: `
        WITH userstats AS (
            SELECT
              created_user,
              count(*) as count
            FROM geohub.style
            WHERE created_user is not null
            GROUP BY created_user
            )
            SELECT count(*) as count FROM userstats
        `,
		values: []
	};

	const res = await client.query(query);
	const stat: number = res.rows[0].count;
	const card: StatsCard = {
		stat: stat,
		title: 'Users',
		description: `${stat} users created maps`
	};

	return card;
};
