import { db } from '$lib/server/db';
import { licenseInGeohub } from '$lib/server/schema';
import { asc } from 'drizzle-orm';
import { Endpoint, z, type RouteModifier } from 'sveltekit-api';
import type { License } from '$lib/types';

export const Output = z
	.custom<License[]>()
	.describe('The list of available open data licenses')
	.openapi({ example: [{ id: 2, name: 'Creative Commons BY 4.0' }] });

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Get the list of available open data licenses';
	c.description = `Get the list of available open data licenses`;
	c.tags = ['license'];
	return c;
};

export default new Endpoint({ Output, Modifier }).handle(async () => {
	const licenses: License[] = await db.query.licenseInGeohub.findMany({
		orderBy: [asc(licenseInGeohub.name)]
	});
	return licenses;
});
