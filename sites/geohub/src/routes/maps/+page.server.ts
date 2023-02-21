import type { PageServerLoad } from './$types'
import { getMapStats } from '$lib/server/helpers'
import { AccessLevel, DEFAULT_LIMIT, MapOrderByOptions } from '$lib/constants'
import type { DashboardMapStyle, Pages, StacLink } from '$lib/types'

export const load: PageServerLoad = async (event) => {
  const { locals, url } = event

  const map_stats = await getMapStats()

  const limit: string = url.searchParams.get('limit') ?? `${DEFAULT_LIMIT}`
  const offset: string = url.searchParams.get('offset') ?? '0'

  let sortby = url.searchParams.get('sortby')
  if (!(sortby && MapOrderByOptions?.find((v) => v.value === sortby))) {
    sortby = MapOrderByOptions[0].value
  }

  const session = await locals.getSession()
  let accesslevel: string = !session ? `${AccessLevel.PUBLIC}` : url.searchParams.get('accesslevel')
  if (!accesslevel) {
    accesslevel = `${AccessLevel.PRIVATE}`
  }
  const query: string = url.searchParams.get('query') ?? ''

  const params: { [key: string]: string } = {
    limit,
    offset,
    sortby,
    accesslevel,
  }
  if (query) {
    params.query = query
  }

  const apiUrl = `/api/style?${Object.keys(params)
    .map((p) => `${p}=${params[p]}`)
    .join('&')}`
  const res = await event.fetch(apiUrl)
  const styles: { styles: DashboardMapStyle[]; links: StacLink[]; pages: Pages } = await res.json()

  return {
    stats: map_stats,
    styles,
  }
}
