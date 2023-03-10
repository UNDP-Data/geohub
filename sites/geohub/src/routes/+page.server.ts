import { DataCategories, TagSearchKeys } from '$lib/config/AppConfig'
import type { UserConfig } from '$lib/config/DefaultUserConfig'
import type { DatasetFeatureCollection, Tag } from '$lib/types'
import { redirect } from '@sveltejs/kit'
import type { Breadcrumb } from '@undp-data/svelte-undp-design'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const { locals, url, parent } = event
  const session = await locals.getSession()
  const user = session?.user

  const parentData = await parent()
  const config: UserConfig = parentData.config

  const data: { style?: JSON; readOnly?: boolean; promises?: { features?: Promise<DatasetFeatureCollection> } } = {}
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
  TagSearchKeys.forEach((tag) => {
    const values = url.searchParams.getAll(tag.key)
    values.forEach((v) => {
      tags.push({ key: tag.key, value: v })
    })
  })

  // reset default query params if it is not in queryparams
  const params: { [key: string]: string } = {}
  const queryoperator = url.searchParams.get('queryoperator')
  if (!queryoperator) {
    params.queryoperator = config.DatasetSearchQueryOperator
  }
  const operator = url.searchParams.get('operator')
  if (!operator) {
    params.operator = config.TagSearchOperator
  }
  const sortby = url.searchParams.get('sortby')
  if (!sortby) {
    params.sortby = config.DatasetSortingColumn
  }
  const limit = url.searchParams.get('limit')
  if (!limit) {
    params.limit = `${config.DatasetSearchLimit}`
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
    const fc = getDatasets(event.fetch, apiUrl)
    // const res2 = await event.fetch(`/api/datasets${apiUrl.search}`)
    // const fc: DatasetFeatureCollection = await res2.json()
    data.promises = {
      features: fc,
    }
  }
  return data
}

const getDatasets = async (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>, url: URL) => {
  const res = await fetch(`/api/datasets${url.search}`)
  const fc: DatasetFeatureCollection = await res.json()
  return fc
}
