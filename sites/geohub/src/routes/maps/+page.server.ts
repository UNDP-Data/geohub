import type { PageServerLoad } from './$types'
import { getMapStats } from '$lib/server/helpers'
import { AccessLevel } from '$lib/constants'
import type { DashboardMapStyle, Pages, StacLink } from '$lib/types'

export const load: PageServerLoad = async (event) => {
  const { locals, url } = event

  const map_stats = await getMapStats()

  const limit: string = url.searchParams.get('limit') ?? '10'
  const offset: string = url.searchParams.get('offset') ?? '0'

  let sortby = url.searchParams.get('sortby')
  let sortByColumn = 'name'
  let SortOrder: 'asc' | 'desc' = 'desc'
  if (sortby) {
    const values = sortby.split(',')
    const column: string = values[0].trim().toLowerCase()
    if (column) {
      const targetSortingColumns = ['updatedat', 'name']
      const targetSortingOrder = ['asc', 'desc']
      if (!targetSortingColumns.includes(column)) {
        sortByColumn = 'updatedat'
      } else {
        sortByColumn = column
      }

      if (values.length > 1) {
        const order: string = values[1].trim().toLowerCase()
        if (!targetSortingOrder.includes(order)) {
          SortOrder = 'desc'
        } else {
          SortOrder = order as 'asc' | 'desc'
        }
      }
    }
  }
  sortby = [sortByColumn, SortOrder].join(',')

  let accesslevel: string = !locals.session ? `${AccessLevel.PUBLIC}` : url.searchParams.get('accesslevel')
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
