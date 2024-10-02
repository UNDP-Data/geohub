import { error, type RequestHandler } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers';
import { ProductManager } from '$lib/server/Product';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;

	const pm = new ProductManager(id as string);
	const product = await pm.get();
	if (!product) {
		error(404, { message: `does not exist in the database` });
	}
	return new Response(JSON.stringify(product));
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	let is_superuser = false;
	const user_email = session?.user.email;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}
	const { description, expression, label } = await request.json();
	const id = params.id as string;

	const pm = new ProductManager(id, description, expression, label);
	let product = await pm.get();
	if (!product) {
		error(404, { message: `Does not exist in the database` });
	}
	product = await pm.update();

	return new Response(JSON.stringify(product));
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session) {
		error(403, { message: 'Permission error' });
	}
	let is_superuser = false;
	const user_email = session?.user.email;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}
	if (!is_superuser) {
		error(403, { message: 'Permission error' });
	}

	const id = params.id;

	const pm = new ProductManager(id as string);

	const product = await pm.get();
	if (!product) {
		error(404, { message: `Does not exist in the database` });
	}
	await pm.delete();

	return new Response(undefined, {
		status: 204
	});
};
