import { db } from '$lib/server/db';
import { usersInGeohub } from '$lib/server/schema';
import { sql } from 'drizzle-orm';

export const upsertUser = async (user_email: string) => {
	await db.execute(sql`
		INSERT INTO ${usersInGeohub} 
		(${usersInGeohub.id}, ${usersInGeohub.userEmail}) 
		values(MD5(${user_email}), ${user_email})
		ON CONFLICT (${usersInGeohub.id}) 
		DO UPDATE 
		SET ${usersInGeohub.lastaccessedat} = now()
	`);
};
