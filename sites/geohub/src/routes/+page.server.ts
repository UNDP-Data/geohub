import { DataCategories, TagSearchKeys } from '$lib/config/AppConfig'
import type { UserConfig } from '$lib/config/DefaultUserConfig'
import type { DatasetFeatureCollection, SavedMapStyle, Tag } from '$lib/types'
import { redirect } from '@sveltejs/kit'
import type { Breadcrumb } from '@undp-data/svelte-undp-design'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const { locals, url, parent } = event
  const session = await locals.getSession()
  const user = session?.user

  const parentData = await parent()
  const config: UserConfig = parentData.config

  const data: {
    promises: {
      style: Promise<SavedMapStyle>
      features?: Promise<DatasetFeatureCollection>
      tags?: Promise<{ [key: string]: Tag[] }>
    }
  } = {
    promises: {
      style: getSavedStyle(event.fetch, url, user?.email),
    },
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

  data.promises.tags = getTags(fetch, new URL(`${url.origin}/api/datasets${apiUrl.search}`))

  const query = apiUrl.searchParams.get('query')
  if (
    query ||
    DataCategories.find((c: Breadcrumb) => apiUrl.search.indexOf(c.url.replace('/api/datasets?', '')) !== -1) ||
    apiUrl.searchParams.get('sdg_goal') ||
    tags.length > 0
  ) {
    apiUrl.searchParams.delete('style')
    const fc = getDatasets(event.fetch, apiUrl)
    data.promises.features = fc
  }
  return data
}

const getSavedStyle = async (
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  url: URL,
  user_email: string,
) => {
  const styleId = url.searchParams.get('style')
  if (styleId) {
    const res = await fetch(`/api/style/${styleId}`)
    if (res.ok) {
      const styleInfo: SavedMapStyle = await res.json()

      let isReadOnly = true
      if (user_email === styleInfo?.created_user) {
        isReadOnly = false
      }
      styleInfo.readOnly = isReadOnly
      return styleInfo
    }
  }
  return
}

const getDatasets = async (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>, url: URL) => {
  const res = await fetch(`/api/datasets${url.search}`)
  const fc: DatasetFeatureCollection = await res.json()
  return fc
}

const getTags = async (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>, url: URL) => {
  url.searchParams.delete('style')
  const apiUrl = `${url.origin}/api/tags?url=${encodeURIComponent(url.toString())}`
  const res = await fetch(apiUrl)
  const json: { [key: string]: Tag[] } = await res.json()

  const tags: { [key: string]: Tag[] } = {}
  TagSearchKeys.forEach((t) => {
    if (!json[t.key]) return
    tags[t.key] = json[t.key]
  })
  return tags
}
