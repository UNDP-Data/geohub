<script lang="ts">
  import { page } from '$app/stores'
  import InfiniteScroll from 'svelte-infinite-scroll'
  import type { DatasetFeatureCollection } from '$lib/types'
  import DataCard from '$components/data-view/DataCard.svelte'
  import { map } from '$stores'
  import TextFilter from '$components/data-view/TextFilter.svelte'
  import Notification from '$components/controls/Notification.svelte'
  import DataCategoryCardList from '$components/data-view/DataCategoryCardList.svelte'
  import { Breadcrumbs, Loader, type Breadcrumb } from '@undp-data/svelte-undp-design'
  import type { Tag } from '$lib/types/Tag'
  import SelectedTags from './data-view/SelectedTags.svelte'
  import { goto } from '$app/navigation'
  import { getSelectedTagsFromUrl } from '$lib/helper'
  import { DataCategories, TagSearchKeys, StacMinimumZoom } from '$lib/config/AppConfig'

  const session = $page.data.session
  const dataCategories: Breadcrumb[] = session
    ? DataCategories
    : DataCategories.filter((category) => !['Favourite', 'My data'].includes(category.name))
  let sdgSubCategories: Breadcrumb[]
  let isLoading = false

  export let contentHeight: number
  let optionsHeight = 41.5

  $: totalHeight = contentHeight - optionsHeight

  let containerDivElement: HTMLDivElement

  let query = $page.url.searchParams.get('query') ?? ''
  let selectedTags: Tag[] = getSelectedTagsFromUrl($page.url)

  let DataItemFeatureCollection: DatasetFeatureCollection = undefined
  let datasetFeaturesPromise: Promise<DatasetFeatureCollection> = $page.data.promises?.features
  if (datasetFeaturesPromise) {
    datasetFeaturesPromise.then((fc) => {
      DataItemFeatureCollection = fc
    })
  }

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

  const fetchNextDatasets = async (url: string) => {
    try {
      // change cursor and disable scroll
      containerDivElement.style.cursor = 'wait'
      containerDivElement.style.overflowY = 'hidden'

      const res = await fetch(url)
      const json: DatasetFeatureCollection = await res.json()
      if (json.features.length > 0) {
        json.features = [...DataItemFeatureCollection.features, ...json.features]
      }
      DataItemFeatureCollection = json
    } finally {
      containerDivElement.style.cursor = ''
      containerDivElement.style.overflowY = 'auto'
    }
  }

  const handleCategorySelected = async (e) => {
    const category = e.detail.category
    if (category.name === 'SDG') {
      await searchSDGCategory(category)
    } else if (category.url.startsWith('/api/datasets')) {
      if (category.name === 'Microsoft Planetary' && $map?.getZoom() < StacMinimumZoom) {
        $map.zoomTo(StacMinimumZoom)
      }

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

  const searchSDGCategory = async (category: Breadcrumb) => {
    try {
      isLoading = true
      const apiUrl = new URL(`${$page.url.origin}${category.url}`)

      const res = await fetch(apiUrl.toString())
      const json = await res.json()
      const values: [{ value: string; count: number }] = json[Object.keys(json)[0]]

      const last = breadcrumbs[breadcrumbs.length - 1]
      if (last.name !== category.name) {
        breadcrumbs = [...breadcrumbs, category]
      }

      let num_values = values.map((v) => Number(v.value))
      num_values = num_values.sort((a, b) => a - b)
      sdgSubCategories = num_values.map((num) => {
        return {
          name: `SDG${num}`,
          icon: `assets/sdgs/${num}.png`,
          url: `/api/datasets?sdg_goal=${num}`,
        } as Breadcrumb
      })
    } finally {
      isLoading = false
    }
  }

  const handleTagChanged = async (e) => {
    selectedTags = e.detail.tags
    const apiUrl = $page.url
    TagSearchKeys.forEach((key) => {
      apiUrl.searchParams.delete(key.key)
    })
    selectedTags?.forEach((t) => {
      apiUrl.searchParams.append(t.key, t.value)
    })

    if (breadcrumbs.length > 0 && !['Search result', 'SDG'].includes(breadcrumbs[breadcrumbs.length - 1].name)) {
      if (selectedTags.length > 0 && !breadcrumbs[breadcrumbs.length - 1].url.startsWith('/api/datasets')) {
        if (!(breadcrumbs.length === 1 && selectedTags.length > 0)) {
          clearDatasets()
          breadcrumbs.pop()
          breadcrumbs = [...breadcrumbs]
          await goto(apiUrl)
          return
        }
      }
    }

    if (breadcrumbs.length === 1 && selectedTags.length === 0 && !query) {
      datasetFeaturesPromise = undefined
      DataItemFeatureCollection = undefined
      await goto(apiUrl)
      return
    } else if (breadcrumbs[breadcrumbs.length - 1].name === 'Search result' && selectedTags.length === 0 && !query) {
      datasetFeaturesPromise = undefined
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
    const datasetUrl = new URL(url)
    const apiUrl = `${$page.url.origin}${datasetUrl.search}`

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
    datasetFeaturesPromise = $page.data.promises?.features
    if (!datasetFeaturesPromise) {
      DataItemFeatureCollection = undefined
    }
    datasetFeaturesPromise?.then((fc) => {
      DataItemFeatureCollection = fc
    })
  }

  const handleBreadcrumpClicked = async (e) => {
    const index: number = e.detail.index
    const breadcrump: Breadcrumb = e.detail.breadcrumb

    if (index === 0) {
      // home
      clearFiltertext()
      breadcrumbs = [breadcrumbs[0]]
      clearDatasets()
      isFavouriteSearch = false

      let apiUrl = $page.url
      apiUrl.searchParams.delete('query')
      apiUrl.searchParams.delete('sdg_goal')
      apiUrl.searchParams.delete('type')
      apiUrl.searchParams.delete('provider')
      apiUrl.searchParams.delete('stac')
      apiUrl.searchParams.delete('staronly')
      apiUrl.searchParams.delete('mydata')
      apiUrl = clearSelectedTags(apiUrl)
      await goto(apiUrl, { replaceState: true, invalidateAll: false })
    } else if (index < breadcrumbs.length - 1) {
      // middle ones
      let last = breadcrumbs[breadcrumbs.length - 1]
      while (last.name !== breadcrump.name) {
        breadcrumbs.pop()
        last = breadcrumbs[breadcrumbs.length - 1]
      }
      clearDatasets()

      breadcrumbs = [...breadcrumbs]

      selectedTags = getSelectedTagsFromUrl($page.url)
      let apiUrl = $page.url
      if (!breadcrumbs[breadcrumbs.length - 1]?.url.startsWith('/api/datasets?') && selectedTags.length > 0) {
        apiUrl = clearSelectedTags(apiUrl)
      }
      if (initTagfilter) {
        await initTagfilter(apiUrl)
      }
      await goto(apiUrl, { replaceState: true, invalidateAll: false })
    }
    expanded = {}
  }

  const clearSelectedTags = (url: URL) => {
    TagSearchKeys.forEach((key) => {
      url.searchParams.delete(key.key)
    })
    selectedTags = []
    return url
  }

  let clearFiltertext = () => {
    query = ''
  }

  let clearDatasets = () => {
    sdgSubCategories = undefined
    datasetFeaturesPromise = undefined
    DataItemFeatureCollection = undefined
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
    {@const dsText = DataItemFeatureCollection.features.length > 1 ? 'datasets were ' : 'dataset was '}
    <Notification type="info">
      {DataItemFeatureCollection.features.length} / {DataItemFeatureCollection.pages.totalCount}
      {dsText}loaded.
    </Notification>
  {/if}
</div>
<div
  class="container data-view-container mx-4"
  style="height: {totalHeight}px;"
  bind:this={containerDivElement}>
  {#await datasetFeaturesPromise}
    <div class="loader-container">
      <Loader size="medium" />
    </div>
  {:then}
    {#if DataItemFeatureCollection && DataItemFeatureCollection.features?.length > 0}
      {#each DataItemFeatureCollection.features as feature}
        <DataCard
          {feature}
          bind:isExpanded={expanded[feature.properties.id]}
          bind:isStarOnly={isFavouriteSearch} />
      {/each}
      <InfiniteScroll
        threshold={100}
        on:loadMore={async () => {
          const link = DataItemFeatureCollection?.links.find((l) => l.rel === 'next')
          if (link) {
            await fetchNextDatasets(link.href)
          }
        }} />
    {:else if DataItemFeatureCollection && DataItemFeatureCollection.features?.length === 0}
      {#if isFavouriteSearch}
        <Notification type="info"
          >No favourite dataset. Please add dataset to favourite by clicking star button.</Notification>
      {:else}
        <Notification type="warning">No data found. Try another keyword.</Notification>
      {/if}
    {:else if isLoading}
      <div class="loader-container">
        <Loader size="medium" />
      </div>
    {:else if sdgSubCategories}
      <DataCategoryCardList
        categories={sdgSubCategories}
        cardSize="small"
        on:selected={handleCategorySelected}
        bind:breadcrumbs />
    {:else}
      <DataCategoryCardList
        categories={dataCategories}
        cardSize="medium"
        on:selected={handleCategorySelected}
        bind:breadcrumbs />
    {/if}
  {/await}
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
