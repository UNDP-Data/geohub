import { DataCategories, SEARCH_PAGINATION_LIMIT, tagSearchKeys } from '$lib/constants'
import type { DatasetFeatureCollection, Tag } from '$lib/types'
import type { Breadcrumb } from '@undp-data/svelte-undp-design'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const { locals, url } = event
  const session = await locals.getSession()
  const user = session?.user

  let data = {}
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

  const tags: Tag[] = []
  tagSearchKeys.forEach((tag) => {
    const values = url.searchParams.getAll(tag.key)
    values.forEach((v) => {
      tags.push({ key: tag.key, value: v })
    })
  })

  const query = url.searchParams.get('query')
  if (
    query ||
    DataCategories.find((c: Breadcrumb) => url.search.indexOf(c.url.replace('/api/datasets', '')) !== -1) ||
    url.searchParams.get('sdg_goal') ||
    tags.length > 0
  ) {
    const apiUrl = new URL(url.toString())
    if (!apiUrl.searchParams.get('limit')) {
      const LIMIT = SEARCH_PAGINATION_LIMIT
      apiUrl.searchParams.set('limit', `${LIMIT}`)
    }
    const res2 = await event.fetch(`/api/datasets${apiUrl.search}`)
    const fc: DatasetFeatureCollection = await res2.json()
    data['features'] = fc
  }

  return data
}
