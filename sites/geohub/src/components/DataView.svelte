<script lang="ts">
  import { page } from '$app/stores'
  import type { DatasetFeatureCollection } from '$lib/types'
  import DataCard from '$components/data-view/DataCard.svelte'
  import { map, indicatorProgress } from '$stores'
  import TextFilter from '$components/data-view/TextFilter.svelte'
  import Notification from '$components/controls/Notification.svelte'
  import { DataCategories, STAC_MINIMUM_ZOOM, tagSearchKeys } from '$lib/constants'
  import DataCategoryCardList from '$components/data-view/DataCategoryCardList.svelte'
  import { Breadcrumbs, Loader, type Breadcrumb } from '@undp-data/svelte-undp-design'
  import type { Tag } from '$lib/types/Tag'
  import SelectedTags from './data-view/SelectedTags.svelte'
  import { goto } from '$app/navigation'
  import { getSelectedTagsFromUrl } from '$lib/helper'

  const session = $page.data.session
  const dataCategories: Breadcrumb[] = session
    ? DataCategories
    : DataCategories.filter((category) => !['Favourite', 'My data'].includes(category.name))

  export let contentHeight: number
  let optionsHeight = 41.5

  $: totalHeight = contentHeight - optionsHeight

  let containerDivElement: HTMLDivElement

  let isLoading = false
  let query = $page.url.searchParams.get('query') ?? ''
  let selectedTags: Tag[] = getSelectedTagsFromUrl($page.url)
  let DataItemFeatureCollection: DatasetFeatureCollection = $page.data.features
  let isFavouriteSearch = false
  let initTagfilter: (url?: URL) => Promise<void>

  const initBreadcrumbs = () => {
    let bc: Breadcrumb[] = [
      {
        name: 'Home',
        icon: 'fas fa-house',
        url: '',
      },
    ]

    const defaultCategory = DataCategories.find(
      (c) => $page.url.search.indexOf(c.url.replace('/api/datasets?', '')) !== -1,
    )
    if (defaultCategory) {
      bc = [...bc, defaultCategory]
    } else {
      const sdg_goal = $page.url.searchParams.get('sdg_goal')
      if (sdg_goal) {
        bc = [
          ...bc,
          DataCategories.find((c) => c.name === 'SDG'),
          {
            name: `SDG${sdg_goal}`,
            icon: `assets/sdgs/${sdg_goal}.png`,
            url: `/api/datasets?sdg_goal=${sdg_goal}`,
          },
        ]
      } else if (bc.length === 1 && (query !== '' || selectedTags.length > 0)) {
        bc = [
          ...bc,
          {
            name: 'Search result',
            icon: 'fas fa-magnifying-glass',
            url: `/api/datasets${$page.url.search}`,
          },
        ]
      }
    }
    return bc
  }

  let breadcrumbs: Breadcrumb[] = initBreadcrumbs()

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
    if ($indicatorProgress) return

    try {
      $indicatorProgress = true
      const res = await fetch(link.href)
      const json: DatasetFeatureCollection = await res.json()
      if (json.features.length > 0) {
        json.features = [...DataItemFeatureCollection.features, ...json.features]
      }
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
      const apiUrl = $page.url
      const categoryUrl = new URL(`${$page.url.origin}${category.url}`)
      for (const key of categoryUrl.searchParams.keys()) {
        const value = categoryUrl.searchParams.get(key)
        if (apiUrl.searchParams.get(key) !== value) {
          apiUrl.searchParams.set(key, value)
        }
      }
      await reload(apiUrl.toString())
    }
  }

  const handleTagChanged = async (e) => {
    selectedTags = e.detail.tags
    const apiUrl = $page.url
    tagSearchKeys.forEach((key) => {
      apiUrl.searchParams.delete(key.key)
    })
    selectedTags?.forEach((t) => {
      apiUrl.searchParams.append(t.key, t.value)
    })

    if (breadcrumbs.length > 0 && !['Search result', 'SDG'].includes(breadcrumbs[breadcrumbs.length - 1].name)) {
      if (selectedTags.length > 0 && !breadcrumbs[breadcrumbs.length - 1].url.startsWith('/api/datasets')) {
        if (!(breadcrumbs.length === 1 && selectedTags.length > 0)) {
          DataItemFeatureCollection = undefined
          breadcrumbs.pop()
          breadcrumbs = [...breadcrumbs]
          await goto(apiUrl)
          return
        }
      }
    }

    if (breadcrumbs.length === 1 && selectedTags.length === 0 && !query) {
      DataItemFeatureCollection = undefined
      await goto(apiUrl)
      return
    } else if (breadcrumbs[breadcrumbs.length - 1].name === 'Search result' && selectedTags.length === 0 && !query) {
      DataItemFeatureCollection = undefined
      breadcrumbs.pop()
      breadcrumbs = [...breadcrumbs]
      await goto(apiUrl)
      return
    }
    await reload(apiUrl.toString())
  }

  const handleFilterChanged = async (e) => {
    const url = e.detail.url
    await reload(url)
  }

  const reload = async (url: string) => {
    try {
      isLoading = true

      const datasetUrl = new URL(url)
      const apiUrl = `${$page.url.origin}${datasetUrl.search}`
      DataItemFeatureCollection = undefined

      await goto(apiUrl, {
        replaceState: true,
        noScroll: true,
        keepFocus: true,
        invalidateAll: true,
      })
      selectedTags = getSelectedTagsFromUrl(new URL(apiUrl))
      if (initTagfilter) {
        initTagfilter(new URL(apiUrl))
      }
      breadcrumbs = initBreadcrumbs()
      DataItemFeatureCollection = $page.data.features
    } finally {
      isLoading = false
    }
  }

  const handleScroll = async () => {
    const containerHeight = containerDivElement.scrollHeight
    const scrollTop = containerDivElement.scrollTop
    let currentScroll = scrollTop + containerDivElement.clientHeight
    let modifier = 100
    if (currentScroll + modifier > containerHeight) {
      if (!isLoading && DataItemFeatureCollection?.links.find((link) => link.rel === 'next')) {
        await fetchNextDatasets()
      }
    }
  }

  const handleBreadcrumpClicked = async (e) => {
    const index: number = e.detail.index
    const breadcrump: Breadcrumb = e.detail.breadcrumb

    if (index === 0) {
      // home
      clearFiltertext()
      breadcrumbs = [breadcrumbs[0]]
      DataItemFeatureCollection = undefined
      isFavouriteSearch = false

      const apiUrl = $page.url
      apiUrl.searchParams.delete('query')
      apiUrl.searchParams.delete('sdg_goal')
      apiUrl.searchParams.delete('type')
      apiUrl.searchParams.delete('provider')
      apiUrl.searchParams.delete('stac')
      apiUrl.searchParams.delete('staronly')
      apiUrl.searchParams.delete('mydata')
      await clearSelectedTags(apiUrl)
    } else if (index < breadcrumbs.length - 1) {
      // middle ones
      let last = breadcrumbs[breadcrumbs.length - 1]
      while (last.name !== breadcrump.name) {
        breadcrumbs.pop()
        last = breadcrumbs[breadcrumbs.length - 1]
      }
      DataItemFeatureCollection = undefined

      breadcrumbs = [...breadcrumbs]

      selectedTags = getSelectedTagsFromUrl($page.url)
      if (!breadcrumbs[breadcrumbs.length - 1]?.url.startsWith('/api/datasets?') && selectedTags.length > 0) {
        await clearSelectedTags($page.url)
      }
      if (initTagfilter) {
        initTagfilter(new URL($page.url))
      }
    }
    expanded = {}
  }

  const clearSelectedTags = async (url: URL) => {
    tagSearchKeys.forEach((key) => {
      url.searchParams.delete(key.key)
    })
    selectedTags = []
    await reload(url.toString())
  }

  let clearFiltertext = () => {
    query = ''
  }
</script>

<div
  class="container mx-4"
  bind:clientHeight={optionsHeight}>
  <TextFilter
    placeholder="Type keywords to search data"
    bind:map={$map}
    bind:query
    bind:initTagfilter
    on:change={handleFilterChanged} />

  <Breadcrumbs
    bind:breadcrumbs
    on:clicked={handleBreadcrumpClicked}
    fontSize="medium" />

  {#key selectedTags}
    <SelectedTags
      on:change={handleTagChanged}
      isClearButtonShown={true} />
  {/key}

  {#if DataItemFeatureCollection && DataItemFeatureCollection.features?.length > 0}
    {@const dsText = DataItemFeatureCollection.features.length > 1 ? 'datasets were' : 'dataset was'}
    <Notification type="info">{DataItemFeatureCollection.pages.totalCount} {dsText} found.</Notification>
  {/if}
</div>
<div
  class="container data-view-container mx-4"
  style="height: {totalHeight}px;"
  on:scroll={handleScroll}
  bind:this={containerDivElement}>
  {#if isLoading}
    <div
      hidden={!isLoading}
      class="loader-container">
      <Loader size="medium" />
    </div>
  {:else if DataItemFeatureCollection && DataItemFeatureCollection.features?.length > 0}
    {#each DataItemFeatureCollection.features as feature}
      <DataCard
        {feature}
        bind:isExpanded={expanded[feature.properties.id]}
        bind:isStarOnly={isFavouriteSearch} />
    {/each}
    {#if !DataItemFeatureCollection?.links.find((link) => link.rel === 'next')}
      <Notification type="info">All data loaded.</Notification>
    {/if}
  {:else if DataItemFeatureCollection && DataItemFeatureCollection.features?.length === 0}
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
</div>

<style lang="scss">
  .data-view-container {
    overflow-y: auto;

    .loader-container {
      width: max-content;
      margin: auto;
    }
  }
</style>
