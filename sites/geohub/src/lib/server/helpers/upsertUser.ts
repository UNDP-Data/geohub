import { generateHashKey } from '$lib/helper';
import { db } from '$lib/server/db';
import { usersInGeohub } from '$lib/server/schema';

export const upsertUser = async (user_email: string) => {
	await db
		.insert(usersInGeohub)
		.values({
			id: generateHashKey(user_email),
			userEmail: user_email
		})
		.onConflictDoUpdate({
			target: [usersInGeohub.id],
			set: {
				lastaccessedat: new Date().toISOString()
			}
		});
};
