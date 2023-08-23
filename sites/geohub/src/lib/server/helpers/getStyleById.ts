import { AccessLevel } from '$lib/config/AppConfig';
import DatabaseManager from '$lib/server/DatabaseManager';
import type { DashboardMapStyle } from '$lib/types';

export const getStyleById = async (id: number, url: URL, email?: string) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `SELECT id, name, style, layers, access_level, createdat, created_user, updatedat, updated_user FROM geohub.style where id = $1`,
			values: [id]
		};

		const res = await client.query(query);

		if (res.rowCount === 0) {
			return undefined;
		}

		const style: DashboardMapStyle = res.rows[0];

		let domain: string;
		if (email) {
			domain = email.split('@').pop();
		}

		const accessLevel: AccessLevel = style.access_level;
		if (accessLevel === AccessLevel.PRIVATE) {
			if (!(email && email === style.created_user)) {
				return new Response(JSON.stringify({ message: 'Permission error' }), {
					status: 403
				});
			}
		} else if (accessLevel === AccessLevel.ORGANIZATION) {
			if (!(domain && style.created_user?.indexOf(domain) > -1)) {
				return new Response(JSON.stringify({ message: 'Permission error' }), {
					status: 403
				});
			}
		}

		style.links = [
			{
				rel: 'root',
				type: 'application/json',
				href: `${url.origin}${url.pathname}`
			},
			{
				rel: 'self',
				type: 'application/json',
				href: `${url.origin}${url.pathname}`
			},
			{
				rel: 'map',
				type: 'text/html',
				href: `${url.origin}/map?style=${style.id}`
			},
			{
				rel: 'stylejson',
				type: 'application/json',
				href: `${url.origin}${url.pathname}.json`
			}
		];

		return res.rows[0];
	} finally {
		dbm.end();
	}
};
