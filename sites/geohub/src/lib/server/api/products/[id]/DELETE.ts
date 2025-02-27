import { z, type RouteModifier, error as apiError } from 'sveltekit-api';
import { ProductManager } from '$lib/server/Product';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import { AddSecurictyModifier } from '$api/securityModifier';
import { error, type RequestEvent } from '@sveltejs/kit';

export const Output = z.null().describe('No content returned').openapi({ example: null });

export const Param = z.object({
	id: z.string().describe('Product ID').openapi({ example: 'ndwi' })
});

export const Error = {
	403: apiError(403, 'Permission error'),
	404: apiError(404, `does not exist in the database`)
};

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Delete a product';
	c.description = `Delete a product by product ID`;
	c.tags = ['products'];
	c = AddSecurictyModifier(c);
	return c;
};

export default async function (
	param: z.infer<typeof Param>,
	{ locals }: RequestEvent
): Promise<Response> {
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
	const id = param.id;

	const pm = new ProductManager(id as string);

	const product = await pm.get();
	if (!product) {
		error(404, { message: `does not exist in the database` });
	}
	await pm.delete();

	return new Response(undefined, {
		status: 204
	});
}
