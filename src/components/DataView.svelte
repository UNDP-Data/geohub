<script lang="ts">
  import { page } from '$app/stores'
  import type { DataCategory, StacItemFeatureCollection } from '$lib/types'
  import DataCategoryCard from './DataCategoryCard.svelte'
  import DataCard from './DataCard.svelte'
  import { map, indicatorProgress } from '$stores'
  import TextFilter from './controls/TextFilter.svelte'
  import { indexOf, last, startsWith } from 'lodash'
  import Notification from './controls/Notification.svelte'
  import { STAC_MINIMUM_ZOOM, SEARCH_PAGINATION_LIMIT, DataCategories } from '$lib/constants'
  import DataCategoryCardList from './DataCategoryCardList.svelte'

  let containerDivElement: HTMLDivElement
  let breadcrumbs: DataCategory[] = []
  const LIMIT = SEARCH_PAGINATION_LIMIT
  let query: string
  let sortingColumn: 'name' | 'source' | 'license' | 'createdat' | 'updatedat' = 'name'
  let isAsc = true
  $: isShownSortbyButton =
    (breadcrumbs && breadcrumbs.length > 0 && breadcrumbs[breadcrumbs.length - 1].url.startsWith('/datasets')) ||
    (DataItemFeatureCollection ? true : false)

  let DataItemFeatureCollection: StacItemFeatureCollection

  $: isAsc, handleSortbyChanged()

  const handleSortbyChanged = async () => {
    if ($indicatorProgress === true) return
    if (!DataItemFeatureCollection) return

    const link = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')
    let url: string
    if (link) {
      url = link.href
    } else {
      const lastCategory = breadcrumbs[breadcrumbs.length - 1]
      if (!lastCategory.url.startsWith('/datasets')) return
      url = lastCategory.url
    }

    await searchDatasets(url)
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

      const apiUrl = new URL(url)
      if (query) {
        if (query.length === 0) {
          apiUrl.searchParams.delete('query')
        } else {
          apiUrl.searchParams.set('query', query)
        }
      }
      apiUrl.searchParams.set('sortby', [sortingColumn, `${isAsc ? 'asc' : 'desc'}`].join(','))
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
</script>

<TextFilter
  placeholder="Filter data"
  on:change={handleFilterInput}
  on:clear={clearFilter} />

<div
  class="container data-view-container mx-4"
  on:scroll={handleScroll}
  bind:this={containerDivElement}>
  <div class="data-list-header">
    {#if breadcrumbs && breadcrumbs.length > 0}
      <nav
        class="breadcrumb has-succeeds-separator breadcrumb-margin"
        aria-label="breadcrumbs">
        <ul class="breadcrumb-margin">
          {#each breadcrumbs as category, index}
            {#if index === 0}
              <li class="breadcrumb-margin">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  on:click={() => {
                    breadcrumbs = []
                    DataItemFeatureCollection = undefined
                    isShownSortbyButton = false
                  }}>{category.name}</a>
              </li>
            {:else if index === breadcrumbs.length - 1}
              <!-- svelte-ignore a11y-missing-attribute -->
              <li class="breadcrumb-margin is-active"><a>{category.name}</a></li>
            {:else}
              <!-- svelte-ignore a11y-missing-attribute -->
              <li class="breadcrumb-margin">
                <a
                  on:click={async () => {
                    let last = breadcrumbs[breadcrumbs.length - 1]
                    while (last.name !== category.name) {
                      breadcrumbs.pop()
                      last = breadcrumbs[breadcrumbs.length - 1]
                    }
                    DataItemFeatureCollection = undefined
                    isShownSortbyButton = last.url.startsWith('/datasets')
                  }}>{category.name}</a>
              </li>
            {/if}
          {/each}
        </ul>
      </nav>
    {/if}

    {#if isShownSortbyButton}
      <span
        class="icon sortby-icon"
        on:click={() => (isAsc = !isAsc)}>
        <i class="fas {`${isAsc ? 'fa-arrow-down-a-z' : 'fa-arrow-up-a-z'}`} fa-lg" />
      </span>
    {/if}
  </div>

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

<style lang="scss">
  @use '../styles/undp-design/base-minimal.min.css';
  @use '../styles/undp-design/buttons.min.css';

  .data-view-container {
    height: calc(100vh - 195px);
    overflow-y: scroll;

    @media (max-width: 89.9375em) {
      height: calc(100vh - 166px);
    }

    .button {
      color: white !important;
    }

    .data-list-header {
      display: flex;

      .breadcrumb-margin {
        float: left;
        margin-bottom: 0.2rem;
      }

      .sortby-icon {
        cursor: pointer;
        margin-top: 0.4rem;
        margin-left: auto;
      }
    }
  }
</style>
