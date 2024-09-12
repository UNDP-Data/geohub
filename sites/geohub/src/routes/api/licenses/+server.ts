import { type RequestHandler } from '@sveltejs/kit';
import type { License } from '$lib/types';
import { db } from '$lib/server/db';
import { asc } from 'drizzle-orm';
import { licenseInGeohub } from '$lib/server/schema';

export const GET: RequestHandler = async () => {
	const licenses: License[] = await db.query.licenseInGeohub.findMany({
		orderBy: [asc(licenseInGeohub.name)]
	});
	return new Response(JSON.stringify(licenses));
};
