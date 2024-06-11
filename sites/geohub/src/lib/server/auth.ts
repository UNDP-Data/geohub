import { SvelteKitAuth } from '@auth/sveltekit';
import AzureADB2C from '@auth/core/providers/azure-ad-b2c';
import GitHub from '@auth/core/providers/github';
import { env } from '$env/dynamic/private';
import { generateHashKey } from '$lib/helper';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { error } from '@sveltejs/kit';
import type { Provider } from '@auth/core/providers';

const providers: Provider[] = [];

if (env.GEOHUB_GITHUB_ID && env.GEOHUB_GITHUB_SECRET) {
	providers.push(
		GitHub({ clientId: env.GEOHUB_GITHUB_ID, clientSecret: env.GEOHUB_GITHUB_SECRET })
	);
}

if (
	env.AZURE_AD_B2C_TENANT_ID &&
	env.AZURE_AD_B2C_CLIENT_ID &&
	env.AZURE_AD_B2C_CLIENT_SECRET &&
	env.AZURE_AD_B2C_APP_NAME
) {
	providers.push(
		AzureADB2C({
			clientId: env.AZURE_AD_B2C_CLIENT_ID,
			clientSecret: env.AZURE_AD_B2C_CLIENT_SECRET,
			issuer: `https://${env.AZURE_AD_B2C_APP_NAME}.b2clogin.com/${env.AZURE_AD_B2C_TENANT_ID}/v2.0/`,
			wellKnown: `https://${env.AZURE_AD_B2C_APP_NAME}.b2clogin.com/${env.AZURE_AD_B2C_APP_NAME}.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_SIGNUP_SIGNIN`,
			authorization: {
				url: `https://${env.AZURE_AD_B2C_APP_NAME}.b2clogin.com/${env.AZURE_AD_B2C_APP_NAME}.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUP_SIGNIN`,
				params: {
					scope: `${env.AZURE_AD_B2C_CLIENT_ID} openid offline_access`,
					response_type: 'code'
				}
			},
			token: `https://${env.AZURE_AD_B2C_APP_NAME}.b2clogin.com/${env.AZURE_AD_B2C_APP_NAME}.onmicrosoft.com/oauth2/v2.0/token?p=B2C_1A_SIGNUP_SIGNIN`,
			allowDangerousEmailAccountLinking: true,
			client: {
				token_endpoint_auth_method: 'client_secret_basic'
			}
		})
	);
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	// to run auth.js correctly, set a constant string if it is not provided
	secret: env.AUTH_SECRET ?? 'geohub-secret',
	providers: providers,
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
				session.user.email = session.user.email.toLowerCase();
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				session.user.id = generateHashKey(session.user.email);
			} else {
				error(500, { message: 'failed to login to this account' });
			}

			// console.log(session)
			return session;
		}
	}
});
