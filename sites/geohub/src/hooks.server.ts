import { sequence } from '@sveltejs/kit/hooks';
import { handle as handleAuth } from '$lib/server/auth';
import { verifyJWT, type TokenPayload } from '$lib/server/token';
import type { Handle } from '@sveltejs/kit';

const redirects = {
	'/management/stac/api': '/management/stac',
	'/management/stac/catalog': '/management/stac',
	'/map': '/maps'
};

const handlePrimary: Handle = async ({ event, resolve }) => {
	let pathname: string = event.url.pathname;
	if (pathname.endsWith('/')) {
		pathname = pathname.replace(/\/$/, '');
	}
	if (pathname in redirects) {
		return new Response(undefined, {
			status: 308,
			headers: {
				location: redirects[pathname as keyof typeof redirects]
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

// https://snippets.khromov.se/configure-cors-in-sveltekit-to-access-your-api-routes-from-a-different-host/
export const handleCORS: Handle = async ({ resolve, event }) => {
	// ignore .svelte endpoints
	if (event.url.pathname.endsWith('.svelte')) {
		return new Response();
	}

	// Apply CORS header for API routes
	if (event.url.pathname.startsWith('/api')) {
		// Required for CORS to work
		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				}
			});
		}
	}

	const response = await resolve(event);
	if (event.url.pathname.startsWith('/api')) {
		response.headers.append('Access-Control-Allow-Origin', `*`);
	}
	return response;
};

const handleAccessToken: Handle = async ({ event, resolve }) => {
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
		const token = event.request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
		if (token) {
			const payload: TokenPayload = await verifyJWT(token);
			if (payload) {
				// update locals.auth function to return payload from token
				event.locals = {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
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

export const handle = sequence(handlePrimary, handleCORS, handleAuth, handleAccessToken);
