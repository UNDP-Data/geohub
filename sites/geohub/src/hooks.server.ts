import { sequence } from '@sveltejs/kit/hooks';
import { handle as handleAuth } from '$lib/server/auth';
import { verifyJWT, type TokenPayload } from '$lib/server/token';

const redirects = {
	'/management/stac/api': '/management/stac',
	'/management/stac/catalog': '/management/stac',
	'/map': '/maps'
};

const handlePrimary = async ({ event, resolve }) => {
	let pathname: string = event.url.pathname;
	if (pathname.endsWith('/')) {
		pathname = pathname.replace(/\/$/, '');
	}
	if (pathname in redirects) {
		return new Response(undefined, {
			status: 308,
			headers: {
				location: redirects[pathname]
			}
		});
	} else if (pathname.startsWith('/map/')) {
		// /map/{id} path name is redirected to /maps/{id}
		const newPathname = pathname.replace('/map/', `${redirects['/map']}/`);
		return new Response(undefined, {
			status: 308,
			headers: {
				location: newPathname
			}
		});
	}

	return resolve(event);
};

const handleAccessToken = async ({ event, resolve }) => {
	const { url } = event;

	if (
		// exclude api doc page (swagger)
		url.pathname !== '/api' &&
		// token is only valid within /api
		url.pathname.startsWith('/api') &&
		// exclude access token for /api/token. Only authenticated users can issue a token
		!url.pathname.startsWith('/api/token') &&
		!url.pathname.startsWith('/api/mapstyle')
	) {
		const token = url.searchParams.get('token');
		if (token) {
			const payload: TokenPayload = await verifyJWT(token);
			if (payload) {
				// update locals.auth function to return payload from token
				event.locals = {
					auth: async () => {
						return {
							user: {
								id: payload.id,
								name: payload.name,
								email: payload.email
							}
						};
					}
				};
				return resolve(event);
			}
		}
	}

	return resolve(event);
};

export const handle = sequence(handlePrimary, handleAuth, handleAccessToken);
