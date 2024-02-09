import { sequence } from '@sveltejs/kit/hooks';
import { handle as handleAuth } from '$lib/server/auth';

const redirects = {
	'/dashboards': '/',
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

export const handle = sequence(handlePrimary, handleAuth);
