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

  let containerDivElement: HTMLDivElement
  let breadcrumbs: DataCategory[] = []
  const LIMIT = SEARCH_PAGINATION_LIMIT
  let query: string
  let sortingColumn: DataSortingColumn = 'name'
  let orderType: DataOrderType = 'asc'

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

    if (breadcrumbs.length === 0 && query === '') return

    const link = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')
    let url = `${$page.url.origin}/datasets`
    if (link) {
      url = link.href
    }
    await searchDatasets(url)
  }

  const clearFilter = async () => {
    query = ''
    if (breadcrumbs) {
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
      breadcrumbs = []
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
  bind:sortingColumn
  bind:orderType
  on:change={handleFilterInput}
  on:clear={clearFilter} />

<div
  class="container data-view-container mx-4"
  on:scroll={handleScroll}
  bind:this={containerDivElement}>
  <div hidden={$indicatorProgress}>
    <Breadcrumbs
      bind:breadcrumbs
      on:clicked={handleBreadcrumpClicked} />

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
  </div>

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
    height: calc(100vh - 173.07px);
    overflow-y: scroll;

    @media (max-width: 89.9375em) {
      height: calc(100vh - 140.57px);
    }

    .button {
      color: white !important;
    }

    .loader {
      position: absolute;
      z-index: 5;
      top: 25%;
      left: 35%;
      transform: translate(-25%, -35%);
      -webkit-transform: translate(-25%, -35%);
      -ms-transform: translate(-25%, -35%);
    }
  }
</style>
