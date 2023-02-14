<script lang="ts">
  import { page } from '$app/stores'
  import type { StacItemFeatureCollection } from '$lib/types'
  import DataCard from '$components/data-view/DataCard.svelte'
  import { map, indicatorProgress } from '$stores'
  import TextFilter from '$components/data-view/TextFilter.svelte'
  import Notification from '$components/controls/Notification.svelte'
  import { SEARCH_PAGINATION_LIMIT, DataCategories, STAC_MINIMUM_ZOOM, SortingColumns } from '$lib/constants'
  import DataCategoryCardList from '$components/data-view/DataCategoryCardList.svelte'
  import { Breadcrumbs, Loader } from '@undp-data/svelte-undp-design'
  import type { Breadcrumb } from '@undp-data/svelte-undp-design/package/interfaces'
  import type { Tag } from '$lib/types/Tag'
  import SelectedTags from './data-view/SelectedTags.svelte'

  const session = $page.data.session
  const dataCategories: Breadcrumb[] = session
    ? DataCategories
    : DataCategories.filter((category) => category.name !== 'Favourite')

  export let contentHeight: number
  let optionsHeight = 41.5

  $: totalHeight = contentHeight - optionsHeight

  let containerDivElement: HTMLDivElement
  let breadcrumbs: Breadcrumb[] = [
    {
      name: 'Home',
      icon: 'fas fa-house',
      url: '',
    },
  ]
  const LIMIT = SEARCH_PAGINATION_LIMIT
  let query: string
  let queryForSearch: string
  let sortingColumn: string = SortingColumns[0].value
  let bbox: [number, number, number, number]
  let isFilterByBBox = false
  let selectedTags: Tag[] = []
  let tagFilterOperatorType: 'and' | 'or' = 'and'
  let DataItemFeatureCollection: StacItemFeatureCollection
  let isFavouriteSearch = false

  $: currentSearchUrl = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')?.href ?? ''

  let expanded: { [key: string]: boolean } = {}
  // to allow only an accordion to be expanded
  let expandedDatasetId: string
  $: {
    let expandedDatasets = Object.keys(expanded).filter((key) => expanded[key] === true && key !== expandedDatasetId)
    if (expandedDatasets.length > 0) {
      expandedDatasetId = expandedDatasets[0]
      Object.keys(expanded)
        .filter((key) => key !== expandedDatasetId)
        .forEach((key) => {
          expanded[key] = false
        })
      expanded[expandedDatasets[0]] = true
    }
  }

  const fetchNextDatasets = async () => {
    if (DataItemFeatureCollection?.features.length === 0) return
    const link = DataItemFeatureCollection.links.find((link) => link.rel === 'next')
    if (!link) return

    try {
      $indicatorProgress = true
      const res = await fetch(link.href)
      const json: StacItemFeatureCollection = await res.json()
      if (json.features.length > 0) {
        json.features = [...DataItemFeatureCollection.features, ...json.features]
      }
      DataItemFeatureCollection = json
    } finally {
      $indicatorProgress = false
    }
  }

  const searchDatasets = async (url: string) => {
    try {
      $indicatorProgress = true

      // clear existing tag parameters except some keys
      const originUrl = new URL(url)
      const sdg_goal = originUrl.searchParams.get('sdg_goal')
      const type = originUrl.searchParams.get('type')
      const provider = originUrl.searchParams.get('provider')
      const stac = originUrl.searchParams.get('stac')
      const starOnly = originUrl.searchParams.get('staronly')
      isFavouriteSearch = starOnly && starOnly.toLowerCase() === 'true' ? true : false

      const apiUrl = new URL(`${originUrl.origin}${originUrl.pathname}`)
      if (sdg_goal) apiUrl.searchParams.set('sdg_goal', sdg_goal)
      if (type) apiUrl.searchParams.set('type', type)
      if (provider) apiUrl.searchParams.set('provider', provider)
      if (stac) apiUrl.searchParams.set('stac', stac)

      if (breadcrumbs.length === 1) {
        if (!query && selectedTags.length === 0) return

        breadcrumbs = [
          ...breadcrumbs,
          {
            name: 'Search result',
            icon: 'fas fa-magnifying-glass',
            url: url.replace(apiUrl.origin, ''),
          },
        ]
      } else if (!breadcrumbs[breadcrumbs.length - 1]?.url.startsWith('/api/datasets')) {
        if (breadcrumbs[breadcrumbs.length - 1]?.url.startsWith('/api/tags')) {
          breadcrumbs.pop()
          breadcrumbs = [
            ...breadcrumbs,
            {
              name: 'Search result',
              icon: 'fas fa-magnifying-glass',
              url: url.replace(apiUrl.origin, ''),
            },
          ]
        } else {
          return
        }
      }

      if (queryForSearch) {
        if (queryForSearch.length > 0) {
          apiUrl.searchParams.set('query', queryForSearch)
        }
      }

      if (bbox && bbox.length === 4) {
        apiUrl.searchParams.set('bbox', bbox.join(','))
      }

      apiUrl.searchParams.set('sortby', sortingColumn)
      apiUrl.searchParams.set('limit', LIMIT.toString())

      if (starOnly) {
        apiUrl.searchParams.set('staronly', starOnly)
      }

      if (selectedTags?.length > 0) {
        apiUrl.searchParams.set('operator', tagFilterOperatorType)
      }
      const tagFilterString = selectedTags?.map((tag) => `${tag.key}=${tag.value}`).join('&')
      const finalUrl = `${apiUrl.toString()}${tagFilterString ? `&${tagFilterString}` : ''}`
      const res = await fetch(finalUrl)
      if (!res.ok) return
      if (DataItemFeatureCollection) {
        DataItemFeatureCollection.features = []
      }
      const json: StacItemFeatureCollection = await res.json()
      DataItemFeatureCollection = json
    } finally {
      $indicatorProgress = false
    }
  }

  const handleCategorySelected = async (e) => {
    const category = e.detail.category
    if (category.name === 'Microsoft Planetary' && $map?.getZoom() < STAC_MINIMUM_ZOOM) {
      $map.zoomTo(STAC_MINIMUM_ZOOM)
    }
    if (category.url.startsWith('/api/datasets')) {
      const url = `${$page.url.origin}${category.url}`
      await searchDatasets(url)
    }
  }

  $: selectedTags, handleTagChanged()
  $: tagFilterOperatorType, handleTagChanged()
  const handleTagChanged = async () => {
    if (breadcrumbs.length > 0 && !['Search result', 'SDG'].includes(breadcrumbs[breadcrumbs.length - 1].name)) {
      if (selectedTags.length > 0 && !breadcrumbs[breadcrumbs.length - 1].url.startsWith('/api/datasets')) {
        if (!(breadcrumbs.length === 1 && selectedTags.length > 0)) {
          DataItemFeatureCollection = undefined
          breadcrumbs.pop()
          breadcrumbs = [...breadcrumbs]
          currentSearchUrl = ''
          return
        }
      }
    }

    if (breadcrumbs.length === 1 && selectedTags.length === 0 && !query) {
      DataItemFeatureCollection = undefined
      currentSearchUrl = ''
      return
    } else if (breadcrumbs[breadcrumbs.length - 1].name === 'Search result' && selectedTags.length === 0 && !query) {
      DataItemFeatureCollection = undefined
      breadcrumbs.pop()
      breadcrumbs = [...breadcrumbs]
      currentSearchUrl = ''
      return
    }

    const link = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')
    let url = `${$page.url.origin}/api/datasets`
    if (link) {
      url = link.href
    }

    await searchDatasets(url)
  }

  const handleFilterInput = async () => {
    if (
      !(breadcrumbs && breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].url.startsWith('/api/datasets')) &&
      query === ''
    )
      return

    const link = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')
    let url = `${$page.url.origin}/api/datasets`
    if (link) {
      url = link.href
    }
    await searchDatasets(url)
  }

  const clearFilter = async () => {
    clearFiltertext()
    if (breadcrumbs && breadcrumbs.length > 0) {
      const lastCategory = breadcrumbs[breadcrumbs.length - 1]
      if (lastCategory?.url?.startsWith('/api/datasets')) {
        if (lastCategory.name === 'Search result' && selectedTags.length === 0) {
          breadcrumbs.pop()
          breadcrumbs = [...breadcrumbs]
          DataItemFeatureCollection = undefined
        } else {
          const url = `${$page.url.origin}${lastCategory.url}`
          await searchDatasets(url)
        }
        return
      }
    }

    DataItemFeatureCollection = undefined
  }

  const handleScroll = async () => {
    const containerHeight = containerDivElement.scrollHeight
    const scrollTop = containerDivElement.scrollTop
    let currentScroll = scrollTop + containerDivElement.clientHeight
    let modifier = 100
    if (currentScroll + modifier > containerHeight) {
      if (!$indicatorProgress && DataItemFeatureCollection?.links.find((link) => link.rel === 'next')) {
        await fetchNextDatasets()
      }
    }
  }

  const handleBreadcrumpClicked = (e) => {
    const index: number = e.detail.index
    const breadcrump: Breadcrumb = e.detail.breadcrumb

    if (index === 0) {
      // home
      clearFiltertext()
      breadcrumbs = [breadcrumbs[0]]
      DataItemFeatureCollection = undefined
      selectedTags = []
      isFavouriteSearch = false
    } else if (index < breadcrumbs.length - 1) {
      // middle ones
      let last = breadcrumbs[breadcrumbs.length - 1]
      while (last.name !== breadcrump.name) {
        breadcrumbs.pop()
        last = breadcrumbs[breadcrumbs.length - 1]
      }
      DataItemFeatureCollection = undefined

      breadcrumbs = [...breadcrumbs]

      if (!breadcrumbs[breadcrumbs.length - 1]?.url.startsWith('/api/datasets') && selectedTags.length > 0) {
        selectedTags = []
      }
    }
    expanded = {}
  }

  let clearFiltertext = () => {
    query = ''
    queryForSearch = ''
  }
</script>

<div
  class="container mx-4"
  bind:clientHeight={optionsHeight}>
  <TextFilter
    placeholder="Type keywords to search data"
    bind:map={$map}
    bind:query
    bind:queryForSearch
    bind:sortingColumn
    bind:bbox
    bind:isFilterByBBox
    bind:selectedTags
    bind:tagFilterOperatorType
    bind:currentSearchUrl
    on:change={handleFilterInput}
    on:clear={clearFilter} />

  <Breadcrumbs
    bind:breadcrumbs
    on:clicked={handleBreadcrumpClicked}
    fontSize="medium" />
  <SelectedTags
    bind:selectedTags
    isClearButtonShown={true} />
  {#if DataItemFeatureCollection && DataItemFeatureCollection.features.length > 0}
    {@const dsText = DataItemFeatureCollection.features.length > 1 ? 'datasets were' : 'dataset was'}
    <Notification type="info">{DataItemFeatureCollection.totalCount} {dsText} found.</Notification>
  {/if}
</div>
<div
  class="container data-view-container mx-4"
  style="height: {totalHeight}px;"
  on:scroll={handleScroll}
  bind:this={containerDivElement}>
  {#if DataItemFeatureCollection && DataItemFeatureCollection.features.length > 0}
    {#each DataItemFeatureCollection.features as feature}
      <DataCard
        {feature}
        bind:isExpanded={expanded[feature.properties.id]}
        bind:isStarOnly={isFavouriteSearch} />
    {/each}
    {#if !DataItemFeatureCollection?.links.find((link) => link.rel === 'next')}
      <Notification type="info">All data loaded.</Notification>
    {/if}
  {:else if DataItemFeatureCollection && DataItemFeatureCollection.features.length === 0}
    {#if isFavouriteSearch}
      <Notification type="info"
        >No favourite dataset. Please add dataset to favourite by clicking star button.</Notification>
    {:else}
      <Notification type="warning">No data found. Try another keyword.</Notification>
    {/if}
  {:else}
    <DataCategoryCardList
      categories={dataCategories}
      cardSize="medium"
      on:selected={handleCategorySelected}
      bind:breadcrumbs />
  {/if}

  {#if !DataItemFeatureCollection}
    <div
      hidden={!$indicatorProgress}
      class="loader-container">
      <Loader size="medium" />
    </div>
  {/if}
</div>

<style lang="scss">
  .data-view-container {
    overflow-y: auto;

    .loader-container {
      position: absolute;
      z-index: 10;
      top: 25%;
      left: 42%;
      background-color: white;
    }
  }
</style>
