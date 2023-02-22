import { DataCategories, SEARCH_PAGINATION_LIMIT, SortingColumns, tagSearchKeys } from '$lib/constants'
import type { DatasetFeatureCollection, Tag } from '$lib/types'
import { redirect } from '@sveltejs/kit'
import type { Breadcrumb } from '@undp-data/svelte-undp-design'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const { locals, url } = event
  const session = await locals.getSession()
  const user = session?.user

  const data: { style?: JSON; readOnly?: boolean; features?: DatasetFeatureCollection } = {}
  const styleId = url.searchParams.get('style')
  let isReadOnly = true
  if (styleId) {
    const res = await event.fetch(`/api/style/${styleId}`)
    if (res.ok) {
      const styleInfo = await res.json()

      if (user?.email === styleInfo?.created_user) {
        isReadOnly = false
      }

      data.style = styleInfo
      data.readOnly = isReadOnly
    }
  }

  const tags: Tag[] = []
  tagSearchKeys.forEach((tag) => {
    const values = url.searchParams.getAll(tag.key)
    values.forEach((v) => {
      tags.push({ key: tag.key, value: v })
    })
  })

  // reset default query params if it is not in queryparams
  const params: { [key: string]: string } = {}
  const queryoperator = url.searchParams.get('queryoperator')
  if (!queryoperator) {
    params.queryoperator = 'and'
  }
  const operator = url.searchParams.get('operator')
  if (!operator) {
    params.operator = 'and'
  }
  const sortby = url.searchParams.get('sortby')
  if (!sortby) {
    params.sortby = SortingColumns[0].value
  }
  const limit = url.searchParams.get('limit')
  if (!limit) {
    params.limit = `${SEARCH_PAGINATION_LIMIT}`
  }
  const apiUrl = new URL(url.toString())
  if (Object.keys(params).length > 0) {
    Object.keys(params).forEach((k) => {
      apiUrl.searchParams.set(k, params[k])
    })
    throw redirect(300, `${apiUrl.origin}${apiUrl.search}`)
  }

  const query = apiUrl.searchParams.get('query')
  if (
    query ||
    DataCategories.find((c: Breadcrumb) => apiUrl.search.indexOf(c.url.replace('/api/datasets?', '')) !== -1) ||
    apiUrl.searchParams.get('sdg_goal') ||
    tags.length > 0
  ) {
    apiUrl.searchParams.delete('style')
    const res2 = await event.fetch(`/api/datasets${apiUrl.search}`)
    const fc: DatasetFeatureCollection = await res2.json()
    data.features = fc
  }
  return data
}
