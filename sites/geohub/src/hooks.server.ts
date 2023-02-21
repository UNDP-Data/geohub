import * as Sentry from '@sentry/node'
import { SvelteKitAuth } from '@auth/sveltekit'
import AzureADProvider from '@auth/core/providers/azure-ad'
import { env } from '$env/dynamic/private'

export const handle = SvelteKitAuth({
  trustHost: true,
  secret: env.AUTH_SECRET,
  providers: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    AzureADProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
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
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      if (token?.accessToken) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
