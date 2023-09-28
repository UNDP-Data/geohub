import { AccessLevel } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import DatabaseManager from '$lib/server/DatabaseManager';
import type { DashboardMapStyle } from '$lib/types';
import { getDatasetById } from './getDatasetById';
import { isSuperuser } from './isSuperuser';

export const getStyleById = async (id: number, url: URL, email?: string) => {
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

		let domain: string;
		if (email) {
			domain = getDomainFromEmail(email);
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
				href: `${url.origin}/map/${style.id}`
			},
			{
				rel: 'stylejson',
				type: 'application/json',
				href: `${url.origin}${url.pathname}.json`
			}
		];

		const is_superuser = await isSuperuser(email);

		for (const l of style.layers) {
			l.dataset = await getDatasetById(client, l.dataset.properties.id, is_superuser, email);
		}

		return style;
	} finally {
		dbm.end();
	}
};
