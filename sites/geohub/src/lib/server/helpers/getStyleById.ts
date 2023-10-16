import DatabaseManager from '$lib/server/DatabaseManager';
import type { DashboardMapStyle } from '$lib/types';
import { createStyleLinks } from './createStyleLinks';
import { getDatasetById } from './getDatasetById';
import { env } from '$env/dynamic/private';

export const getStyleById = async (id: number, url: URL, email?: string, is_superuser = false) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `
			SELECT 
			id, 
			name, 
			style, 
			layers, 
			access_level, 
			createdat, 
			created_user, 
			updatedat, 
			updated_user,
			${
				email
					? `
					CASE
						WHEN (
						SELECT count(style_id) as count FROM geohub.style_favourite 
						WHERE style_id=id and user_email='${email}'
						) > 0 THEN true
						ELSE false
					END as is_star
					`
					: 'false as is_star'
			}
			FROM geohub.style 
			where id = $1`,
			values: [id]
		};

		const res = await client.query(query);

		if (res.rowCount === 0) {
			return undefined;
		}

		const style: DashboardMapStyle = res.rows[0];

		// set URL origin if URL starts with /api
		// if origin is localhost, it set dev.undpgeohub.org for testing
		const origin = url.origin.indexOf('localhost') > -1 ? env.GEOHUB_API_ENDPOINT : url.origin;
		Object.keys(style.style.sources).forEach((key) => {
			const source = style.style.sources[key];
			if ('url' in source && source.url.startsWith('/api')) {
				source.url = `${origin}${source.url}`;
			} else if ('tiles' in source) {
				source.tiles.forEach((tile) => {
					if (tile.startsWith('/api')) {
						tile = `${origin}${tile}`;
					}
				});
			}
		});

		style.links = createStyleLinks(style, url);

		if (style.layers) {
			for (const l of style.layers) {
				l.dataset = await getDatasetById(client, l.dataset.properties.id, is_superuser, email);
			}
		}

		return style;
	} finally {
		dbm.end();
	}
};
