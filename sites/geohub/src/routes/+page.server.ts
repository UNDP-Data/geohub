import { DataCategories, TagSearchKeys } from '$lib/config/AppConfig'
import type { UserConfig } from '$lib/config/DefaultUserConfig'
import type { DatasetFeatureCollection, SavedMapStyle, Tag } from '$lib/types'
import { redirect } from '@sveltejs/kit'
import type { Breadcrumb } from '@undp-data/svelte-undp-design'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async (event) => {
  const { locals, url, parent, fetch } = event
  const session = await locals.getSession()
  const user = session?.user

  const parentData = await parent()
  const config: UserConfig = parentData.config

  const data: {
    menu?: Breadcrumb[]
    breadcrumbs?: Breadcrumb[]
    promises: {
      style: Promise<SavedMapStyle>
      features?: Promise<DatasetFeatureCollection>
      tags?: Promise<{ [key: string]: Tag[] }>
    }
  } = {
    promises: {
      style: getSavedStyle(fetch, url, user?.email),
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

  const breadcrumbs = url.searchParams.get('breadcrumbs')
  if (!breadcrumbs) {
    params.breadcrumbs = `Home`
  }

  const apiUrl = new URL(url.toString())
  if (Object.keys(params).length > 0) {
    Object.keys(params).forEach((k) => {
      apiUrl.searchParams.set(k, params[k])
    })
    throw redirect(300, `${apiUrl.origin}${apiUrl.search}`)
  }

  const selectedMenus = breadcrumbs.split(',')
  if (selectedMenus.length < 2) {
    const menu: Breadcrumb[] = session
      ? DataCategories
      : DataCategories.filter((category) => !['Favourite', 'My data'].includes(category.name))

    data.menu = menu
  } else if (selectedMenus[selectedMenus.length - 1] === 'SDG') {
    data.menu = await createSDGMenu(fetch, url)
  }

  const query = apiUrl.searchParams.get('query')

  if (selectedMenus.length === 1 && (query?.length > 0 || tags?.length > 0)) {
    if (!selectedMenus.includes('Search result')) {
      selectedMenus.push('Search result')
    }
  }

  data.breadcrumbs = getBreadcrumbs(apiUrl, selectedMenus)

  data.promises.tags = getTags(fetch, new URL(`${url.origin}/api/datasets${apiUrl.search}`))

  if (
    query ||
    DataCategories.find((c: Breadcrumb) => apiUrl.search.indexOf(c.url.replace('/api/datasets?', '')) !== -1) ||
    apiUrl.searchParams.get('sdg_goal') ||
    tags.length > 0
  ) {
    apiUrl.searchParams.delete('style')
    const fc = getDatasets(fetch, apiUrl)
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

const getBreadcrumbs = (url: URL, menus: string[]) => {
  const sdg_goal = url.searchParams.get('sdg_goal')

  const breadcrumbs = menus.map((m) => {
    let bc: Breadcrumb
    switch (m) {
      case 'Home':
        bc = {
          name: 'Home',
          icon: 'fas fa-house',
          url: '',
        }
        break
      case 'SDG':
        bc = DataCategories.find((c) => c.name.toLowerCase() === m.toLowerCase())
        break
      case 'Search result':
        bc = {
          name: 'Search result',
          icon: 'fas fa-magnifying-glass',
          url: `/api/datasets${url.search}`,
        }
        break
      default:
        if (sdg_goal) {
          bc = {
            name: `SDG${sdg_goal}`,
            icon: `assets/sdgs/${sdg_goal}.png`,
            url: `/api/datasets?sdg_goal=${sdg_goal}`,
          }
        } else {
          bc = DataCategories.find((c) => c.name.toLowerCase() === m.toLowerCase())
        }
        break
    }
    return bc
  })
  return breadcrumbs
}

const createSDGMenu = async (fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>, url: URL) => {
  const sdgBreadcrumb = DataCategories.find((b) => b.name === 'SDG')

  const apiUrl = new URL(`${url.origin}${sdgBreadcrumb.url}`)

  const res = await fetch(apiUrl.toString())
  const json = await res.json()
  const values: [{ value: string; count: number }] = json[Object.keys(json)[0]]

  let num_values = values.map((v) => Number(v.value))
  num_values = num_values.sort((a, b) => a - b)
  const sdgs = num_values.map((num) => {
    return {
      name: `SDG${num}`,
      icon: `assets/sdgs/${num}.png`,
      url: `/api/datasets?sdg_goal=${num}`,
    } as Breadcrumb
  })
  return sdgs
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
