import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { superuserInGeohub } from '$lib/server/schema';

export const isSuperuser = async (user_email: string) => {
	const users = await db
		.select({ user_email: superuserInGeohub.userEmail })
		.from(superuserInGeohub)
		.where(eq(superuserInGeohub.userEmail, user_email));

	return users.length > 0 ? true : false;
};
