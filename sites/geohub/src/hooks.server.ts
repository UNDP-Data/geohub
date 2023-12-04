import { sequence } from '@sveltejs/kit/hooks';
import { SvelteKitAuth } from '@auth/sveltekit';
import AzureADProvider from '@auth/core/providers/azure-ad';
import GitHub from '@auth/core/providers/github';
import { env } from '$env/dynamic/private';
import { getMe, isSuperuser, upsertUser } from '$lib/server/helpers';
import { generateHashKey } from '$lib/helper';

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
	}

	return resolve(event);
};

const handleAuth = SvelteKitAuth({
	trustHost: true,
	secret: env.AUTH_SECRET,
	providers: [
		GitHub({ clientId: env.GEOHUB_GITHUB_ID, clientSecret: env.GEOHUB_GITHUB_SECRET }),
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		AzureADProvider({
			clientId: env.AZURE_AD_CLIENT_ID,
			clientSecret: env.AZURE_AD_CLIENT_SECRET,
			tenantId: env.AZURE_AD_TENANT_ID,
			// issuer: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/v2.0`,
			authorization: { params: { scope: 'openid profile user.Read email' } }
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

				const me = await getMe(account.access_token);
				token.jobTitle = me.jobTitle;
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
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			session.user.jobTitle = token.jobTitle;

			if (session?.user?.email) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				session.user.id = generateHashKey(session.user.email);

				if (!('is_superuser' in session.user)) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					session.user.is_superuser = await isSuperuser(session.user.email);
				}

				// store signed up user email to database. If not first time visit, update last accessed time column
				upsertUser(session.user.email);
			}

			// console.log(session)
			return session;
		}
	}
});

export const handle = sequence(handlePrimary, handleAuth);
