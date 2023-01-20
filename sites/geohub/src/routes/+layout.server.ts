import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async (event) => {
  const data = {}
  const session = await event.locals.getSession()
  if (session) {
    data['session'] = session
  }
  return data
}
