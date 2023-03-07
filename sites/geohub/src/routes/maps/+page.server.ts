import type { PageServerLoad } from './$types'
import { getMapStats } from '$lib/server/helpers'
import type { DashboardMapStyle, Pages, StacLink } from '$lib/types'
import { redirect } from '@sveltejs/kit'
import { AccessLevel, MapSortingColumns } from '$lib/config/AppConfig'

export const load: PageServerLoad = async (event) => {
  const { locals, url, parent } = event
  const session = await locals.getSession()

  const { config } = await parent()

  const apiUrl = new URL(url)

  // reset default query params if it is not in queryparams
  const sortby = url.searchParams.get('sortby')
  if (!sortby) {
    apiUrl.searchParams.set('sortby', MapSortingColumns[0].value)
  }
  const limit = url.searchParams.get('limit')
  if (!limit) {
    apiUrl.searchParams.set('limit', `${config.SearchLimit}`)
  }
  const offset = url.searchParams.get('offset')
  if (!offset) {
    apiUrl.searchParams.set('offset', `0`)
  }

  const accesslevel: string = url.searchParams.get('accesslevel')
  if (!session) {
    apiUrl.searchParams.set('accesslevel', `${AccessLevel.PUBLIC}`)
  } else if (!accesslevel) {
    apiUrl.searchParams.set('accesslevel', `${AccessLevel.PRIVATE}`)
  }

  if (apiUrl.search !== url.search) {
    throw redirect(300, `${apiUrl.pathname}${apiUrl.search}`)
  }

  const map_stats = await getMapStats()

  const res = await event.fetch(`/api/style${apiUrl.search}`)
  const styles: { styles: DashboardMapStyle[]; links: StacLink[]; pages: Pages } = await res.json()

  return {
    stats: map_stats,
    styles,
  }
}
