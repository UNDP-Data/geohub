import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'
import type { DatasetFeatureCollection } from '$lib/types'

export const load: PageServerLoad = async (event) => {
  const { locals, url } = event
  const session = await locals.getSession()
  if (!session) throw error(403, { message: 'No permission' })

  const limit = url.searchParams.get('limit') ? url.searchParams.get('limit') : '5'
  const offset = url.searchParams.get('offset') ? url.searchParams.get('offset') : '0'

  let sortby = url.searchParams.get('sortby')
  let sortByColumn = 'name'
  let SortOrder: 'asc' | 'desc' = 'asc'
  if (sortby) {
    const values = sortby.split(',')
    const column: string = values[0].trim().toLowerCase()
    if (column) {
      const targetSortingColumns = ['name', 'license', 'createdat', 'updatedat', 'no_stars']
      const targetSortingOrder = ['asc', 'desc']
      if (!targetSortingColumns.includes(column)) {
        console.log(targetSortingColumns, column)
        throw error(400, {
          message: `Bad parameter for 'sortby'. It must be one of '${targetSortingColumns.join(', ')}'`,
        })
      }
      sortByColumn = column

      if (values.length > 1) {
        const order: string = values[1].trim().toLowerCase()
        if (!targetSortingOrder.includes(order)) {
          throw error(400, {
            message: `Bad parameter for 'sortby'. Sorting order must be one of '${targetSortingOrder.join(', ')}'`,
          })
        }
        SortOrder = order as 'asc' | 'desc'
      }
    }
  }
  sortby = [sortByColumn, SortOrder].join(',')

  const query = url.searchParams.get('query')

  const params: { [key: string]: string } = {
    limit,
    offset,
    sortby,
  }
  if (query) {
    params.query = query
  }

  const res = await event.fetch(
    `/api/datasets?${Object.keys(params)
      .map((p) => `${p}=${params[p]}`)
      .join('&')}`,
  )
  const features: DatasetFeatureCollection = await res.json()

  return {
    features,
  }
}
