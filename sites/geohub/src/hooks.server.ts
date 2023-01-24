import * as Sentry from '@sentry/node'
import { SvelteKitAuth } from '@auth/sveltekit'
import AzureADProvider from '@auth/core/providers/azure-ad'
import { AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, AZURE_AD_TENANT_ID, AUTH_SECRET } from '$env/static/private'

export const handle = SvelteKitAuth({
  trustHost: true,
  secret: AUTH_SECRET,
  providers: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    AzureADProvider({
      clientId: AZURE_AD_CLIENT_ID,
      clientSecret: AZURE_AD_CLIENT_SECRET,
      tenantId: AZURE_AD_TENANT_ID,
      // issuer: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/v2.0`,
      authorization: { params: { scope: 'openid profile user.Read email' } },
    }),
  ],
  // https://authjs.dev/guides/basics/callbacks
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      if (token?.accessToken) {
        session.accessToken = token.accessToken
      }
      return session
    },
  },
})

export function handleError({ error, event }) {
  // example integration with https://sentry.io/
  Sentry.captureException(error, { event })

  return {
    message: error.message ?? 'Whoops!',
    code: error?.code,
  }
}
