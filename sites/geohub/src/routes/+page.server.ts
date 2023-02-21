import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.getSession()
  const user = session?.user

  let data = {}
  const url = event.url
  const styleId = url.searchParams.get('style')
  let isReadOnly = true
  if (styleId) {
    const res = await event.fetch(`/api/style/${styleId}`)
    if (res.ok) {
      const styleInfo = await res.json()

      if (user?.email === styleInfo?.created_user) {
        isReadOnly = false
      }

      data = { style: styleInfo, readOnly: isReadOnly }
    }
  }
  return data
}
