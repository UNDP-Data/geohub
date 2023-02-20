import type { PageServerLoad } from './$types'
import type { DatasetFeatureCollection } from '$lib/types'
import { DEFAULT_LIMIT, SortingColumns } from '$lib/constants'

export const load: PageServerLoad = async (event) => {
  const { locals, url } = event
  const session = await locals.getSession()
  if (!session) return {}

  const limit = url.searchParams.get('limit') ? url.searchParams.get('limit') : `${DEFAULT_LIMIT}`
  const offset = url.searchParams.get('offset') ? url.searchParams.get('offset') : '0'

  let sortby = url.searchParams.get('sortby')
  if (!(sortby && SortingColumns?.find((v) => v.value === sortby))) {
    sortby = SortingColumns[0].value
  }

  const query = url.searchParams.get('query')

  const params: { [key: string]: string } = {
    limit,
    offset,
    sortby,
    type: 'azure', // only azure's user data is avalable for data page
  }
  if (query) {
    params.query = query
  }

  const apiUrl = `/api/datasets?${Object.keys(params)
    .map((p) => `${p}=${params[p]}`)
    .join('&')}`
  const res = await event.fetch(apiUrl)
  const features: DatasetFeatureCollection = await res.json()

  return {
    features,
  }
}
