import { sequence } from '@sveltejs/kit/hooks';
import { SvelteKitAuth } from '@auth/sveltekit';
import AzureADB2C from '@auth/core/providers/azure-ad-b2c';
import GitHub from '@auth/core/providers/github';
import { env } from '$env/dynamic/private';
import { isSuperuser } from '$lib/server/helpers';
import { generateHashKey } from '$lib/helper';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { error } from '@sveltejs/kit';

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

const handleAuth = SvelteKitAuth({
	trustHost: true,
	secret: env.AUTH_SECRET,
	providers: [
		GitHub({ clientId: env.GEOHUB_GITHUB_ID, clientSecret: env.GEOHUB_GITHUB_SECRET }),
		AzureADB2C({
			clientId: env.AZURE_AD_B2C_CLIENT_ID,
			clientSecret: env.AZURE_AD_B2C_CLIENT_SECRET,
			issuer: `https://undpaccessdev.b2clogin.com/${env.AZURE_AD_B2C_TENANT_ID}/v2.0/`,
			wellKnown: `https://undpaccessdev.b2clogin.com/Undpaccessdev.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_SIGNUP_SIGNIN`,
			authorization: {
				url: `https://undpaccessdev.b2clogin.com/Undpaccessdev.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUP_SIGNIN`,
				params: {
					scope: `${env.AZURE_AD_B2C_CLIENT_ID} openid offline_access`,
					response_type: 'code'
				}
			},
			token: `https://undpaccessdev.b2clogin.com/Undpaccessdev.onmicrosoft.com/oauth2/v2.0/token?p=B2C_1A_SIGNUP_SIGNIN`,
			allowDangerousEmailAccountLinking: true,
			client: {
				token_endpoint_auth_method: 'client_secret_basic'
			}
		})
	],
	pages: {
		signIn: '/auth/signIn'
	},
	// https://authjs.dev/guides/basics/callbacks
	callbacks: {
		async jwt({ token, account }) {
			// Persist the OAuth access_token to the token right after signin
			if (account?.access_token) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }) {
			// Send properties to the client, like an access_token from a provider.

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const accessToken: string = token.accessToken;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			session.accessToken = accessToken;

			if (!session?.user?.email) {
				const decoded: JwtPayload & { email: string } = jwtDecode(accessToken);
				if (decoded.email) {
					session.user.email = decoded.email;
				}
			}

			if (session?.user?.email) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				session.user.id = generateHashKey(session.user.email);

				if (!('is_superuser' in session.user)) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					session.user.is_superuser = await isSuperuser(session.user.email);
				}
			} else {
				throw error(500, { message: 'failed to login to this account' });
			}

			// console.log(session)
			return session;
		}
	}
});

export const handle = sequence(handlePrimary, handleAuth);
