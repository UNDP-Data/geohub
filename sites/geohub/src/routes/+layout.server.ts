import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.getSession()
  if (session?.accessToken) {
    const token = session.accessToken
    const me = await getMe(token)
    session.user.jobTitle = me.jobTitle
  }
  return {
    session: session,
  }
}

const getMe = async (token: string) => {
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const json = await res.json()
  return json
}
