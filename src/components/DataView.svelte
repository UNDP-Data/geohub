<script lang="ts">
  import { page } from '$app/stores'
  import type { DataCategory, DataOrderType, DataSortingColumn, StacItemFeatureCollection } from '$lib/types'
  import DataCategoryCard from './DataCategoryCard.svelte'
  import DataCard from './DataCard.svelte'
  import { map, indicatorProgress } from '$stores'
  import TextFilter from './controls/TextFilter.svelte'
  import { indexOf, last, startsWith } from 'lodash'
  import Notification from './controls/Notification.svelte'
  import { STAC_MINIMUM_ZOOM, SEARCH_PAGINATION_LIMIT, DataCategories } from '$lib/constants'
  import DataCategoryCardList from './DataCategoryCardList.svelte'
  import Breadcrumbs from './controls/Breadcrumbs.svelte'

  export let headerHeight: number
  export let tabsHeight: number
  let textFilterHeight: number
  let breadcrumbsHeight: number

  let containerDivElement: HTMLDivElement
  let breadcrumbs: DataCategory[] = [
    {
      name: 'Home',
      icon: 'fas fa-house',
      url: '',
    },
  ]
  const LIMIT = SEARCH_PAGINATION_LIMIT
  let query: string
  let sortingColumn: DataSortingColumn = 'name'
  let orderType: DataOrderType = 'asc'
  let bbox: [number, number, number, number]
  let isFilterByBBox = false

  let DataItemFeatureCollection: StacItemFeatureCollection

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
      DataItemFeatureCollection = undefined

      const apiUrl = new URL(url)
      if (query) {
        if (query.length === 0) {
          apiUrl.searchParams.delete('query')
        } else {
          apiUrl.searchParams.set('query', query)
        }
      }

      if (bbox && bbox.length === 4) {
        apiUrl.searchParams.set('bbox', bbox.join(','))
      } else {
        apiUrl.searchParams.delete('bbox')
      }

      apiUrl.searchParams.set('sortby', [sortingColumn, orderType].join(','))
      apiUrl.searchParams.set('limit', LIMIT.toString())
      apiUrl.searchParams.delete('offset')
      const res = await fetch(apiUrl.toString())
      if (!res.ok) return
      const json: StacItemFeatureCollection = await res.json()
      DataItemFeatureCollection = json
    } finally {
      $indicatorProgress = false
    }
  }

  const handleCategorySelected = async (e) => {
    const category = e.detail.category
    if (category.url.startsWith('/datasets')) {
      const url = `${$page.url.origin}${category.url}`
      await searchDatasets(url)
    }
  }

  const handleFilterInput = async (e) => {
    query = e.detail.query

    if (
      !(breadcrumbs && breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].url.startsWith('/datasets')) &&
      query === ''
    )
      return

    const link = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')
    let url = `${$page.url.origin}/datasets`
    if (link) {
      url = link.href
    }
    await searchDatasets(url)
  }

  const clearFilter = async () => {
    query = ''
    if (breadcrumbs && breadcrumbs.length > 0) {
      const lastCategory = breadcrumbs[breadcrumbs.length - 1]
      if (lastCategory?.url?.startsWith('/datasets')) {
        const url = `${$page.url.origin}${lastCategory.url}`
        await searchDatasets(url)
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
    const breadcrump: DataCategory = e.detail.breadcrumb

    if (index === 0) {
      // home
      breadcrumbs = [breadcrumbs[0]]
      DataItemFeatureCollection = undefined
    } else if (index < breadcrumbs.length - 1) {
      // middle ones
      let last = breadcrumbs[breadcrumbs.length - 1]
      while (last.name !== breadcrump.name) {
        breadcrumbs.pop()
        last = breadcrumbs[breadcrumbs.length - 1]
      }
      DataItemFeatureCollection = undefined
    }
  }
</script>

<TextFilter
  placeholder="Type keywords to search data"
  bind:map={$map}
  bind:sortingColumn
  bind:orderType
  bind:bbox
  bind:isFilterByBBox
  bind:height={textFilterHeight}
  on:change={handleFilterInput}
  on:clear={clearFilter} />

<div class="container mx-4">
  <Breadcrumbs
    bind:breadcrumbs
    bind:height={breadcrumbsHeight}
    on:clicked={handleBreadcrumpClicked} />
</div>
<div
  class="container data-view-container mx-4"
  style="height: calc(100vh - {headerHeight + tabsHeight + textFilterHeight + breadcrumbsHeight}px);overflow-y: scroll"
  on:scroll={handleScroll}
  bind:this={containerDivElement}>
  {#if DataItemFeatureCollection && DataItemFeatureCollection.features.length > 0}
    {#each DataItemFeatureCollection.features as feature}
      <DataCard {feature} />
    {/each}
    {#if !DataItemFeatureCollection?.links.find((link) => link.rel === 'next')}
      <Notification type="info">All data loaded</Notification>
    {/if}
  {:else if DataItemFeatureCollection && DataItemFeatureCollection.features.length === 0}
    <Notification type="warning">No data found</Notification>
  {:else}
    <DataCategoryCardList
      categories={DataCategories}
      cardSize="medium"
      on:selected={handleCategorySelected}
      bind:breadcrumbs />
  {/if}

  <div class={`${$indicatorProgress ? 'modal-background' : ''}`} />

  <div
    hidden={!$indicatorProgress}
    class="loader"
    aria-busy="true"
    aria-live="polite" />
</div>

<style lang="scss">
  @use '../styles/undp-design/base-minimal.min.css';
  @use '../styles/undp-design/buttons.min.css';
  @use '../styles/undp-design/loader.min.css';

  .data-view-container {
    .button {
      color: white !important;
    }

    .modal-background {
      z-index: 10;
    }

    .loader {
      position: absolute;
      z-index: 10;
      top: 25%;
      left: 35%;
      transform: translate(-25%, -35%);
      -webkit-transform: translate(-25%, -35%);
      -ms-transform: translate(-25%, -35%);
    }
  }
</style>
