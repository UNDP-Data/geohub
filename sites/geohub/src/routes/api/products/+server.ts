import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers';
import { ProductManager } from '$lib/server/Product';
import { db } from '$lib/server/db';
import { productInGeohub } from '$lib/server/schema';

export const GET: RequestHandler = async () => {
	const products = await db
		.select({
			id: productInGeohub.id,
			description: productInGeohub.description,
			expression: productInGeohub.expression,
			label: productInGeohub.label
		})
		.from(productInGeohub);

	return new Response(JSON.stringify(products));
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	const user_email = session?.user.email;

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}
	const { id, description, expression, label } = await request.json();

	const pm = new ProductManager(id, description, expression, label);
	const product = await pm.insert();
	return new Response(JSON.stringify(product));
};
