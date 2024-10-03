import type { Stac } from '$lib/types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { stacInGeohub } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const getSTACs = async (id?: string) => {
	let options;
	if (id) {
		options = {
			where: eq(stacInGeohub.id, id)
		};
	}

	const stacs: Stac[] = (await db.query.stacInGeohub.findMany(options)) as Stac[];
	return stacs;
};

export const getSTAC = async (id: string) => {
	const stacs = await getSTACs(id);
	return stacs && stacs.length > 0 ? stacs[0] : undefined;
};

export const upsertSTAC = async (stac: Stac, user_email: string) => {
	const requiredProps = ['id', 'name', 'url', 'type'];
	requiredProps.forEach((prop) => {
		if (prop in stac) return;
		error(400, `${prop} property is required`);
	});

	const now = new Date().toISOString();

	const data = await db
		.insert(stacInGeohub)
		.values({
			id: stac.id,
			name: stac.name,
			url: stac.url,
			type: stac.type,
			providers: stac.providers,
			createdat: now,
			createdUser: user_email
		})
		.onConflictDoUpdate({
			target: stacInGeohub.id,
			set: {
				name: stac.name,
				url: stac.url,
				type: stac.type,
				providers: stac.providers,
				updatedat: now,
				updatedUser: user_email
			}
		})
		.returning();

	return data;
};

export const deleteSTAC = async (id: string) => {
	const stac = await getSTAC(id);
	if (!stac) {
		error(404, { message: 'Not found' });
	}
	await db.delete(stacInGeohub).where(eq(stacInGeohub.id, id));
};
