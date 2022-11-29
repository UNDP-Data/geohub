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

  let containerDivElement: HTMLDivElement
  let selectedCategories: DataCategory[] = []
  const LIMIT = SEARCH_PAGINATION_LIMIT
  let query: string
  let sortingColumn: 'name' | 'source' | 'license' | 'createdat' | 'updatedat' = 'name'
  let isAsc = true
  $: isShownSortbyButton =
    (selectedCategories &&
      selectedCategories.length > 0 &&
      selectedCategories[selectedCategories.length - 1].url.startsWith('/datasets')) ||
    (DataItemFeatureCollection ? true : false)

  let subCategories: DataCategory[] = []

  let DataItemFeatureCollection: StacItemFeatureCollection

  $: isAsc, handleSortbyChanged()

  const handleSelectCategory = async (category: DataCategory) => {
    try {
      $indicatorProgress = true

      if (selectedCategories.length === 0) {
        selectedCategories = [
          {
            name: 'Home',
            icon: '',
            url: '',
          },
        ]
      }

      if (category.name === 'SDG') {
        await searchCategory(category)
      } else {
        await handleSelectSubcategory(category)
      }
    } finally {
      $indicatorProgress = false
    }
  }

  const handleSelectSubcategory = async (category: DataCategory) => {
    try {
      $indicatorProgress = true

      if (['Microsoft Planetary'].includes(category.name)) {
        const zoom = $map.getZoom()
        if (zoom < STAC_MINIMUM_ZOOM) {
          $map.zoomTo(STAC_MINIMUM_ZOOM)
        }
      }

      if (selectedCategories) {
        const lastCategory = selectedCategories[selectedCategories.length - 1]
        if (lastCategory?.name !== category.name) {
          selectedCategories = [...selectedCategories, category]
        }
      }

      if (category.url.startsWith('/datasets')) {
        const url = `${$page.url.origin}${category.url}`
        await searchDatasets(url)
      }
      return category
    } finally {
      $indicatorProgress = false
    }
  }

  const handleSortbyChanged = async () => {
    if ($indicatorProgress === true) return
    if (!DataItemFeatureCollection) return
    try {
      $indicatorProgress = true

      const link = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')
      let url: string
      if (link) {
        url = link.href
      } else {
        const lastCategory = selectedCategories[selectedCategories.length - 1]
        if (!lastCategory.url.startsWith('/datasets')) return
        url = lastCategory.url
      }

      await searchDatasets(url)
    } finally {
      $indicatorProgress = false
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

  const searchCategory = async (category: DataCategory) => {
    const apiUrl = new URL(`${$page.url.origin}${category.url}`)
    const res = await fetch(apiUrl.toString())
    const json = await res.json()
    const values: string[] = json[Object.keys(json)[0]]

    selectedCategories = [...selectedCategories, category]

    const num_values: number[] = values.map((v) => Number(v)).sort((a, b) => a - b)
    subCategories = num_values.map((num) => {
      return {
        name: `SDG${num}`,
        icon: `/sdgs/${num}.png`,
        url: `/datasets?sdg_goal=${num}`,
      }
    })
  }

  const searchDatasets = async (url: string) => {
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
  }

  const handleFilterInput = async (e) => {
    query = e.detail.query

    try {
      $indicatorProgress = true

      const link = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')
      let url = `${$page.url.origin}/datasets`
      if (link) {
        url = link.href
      }
      await searchDatasets(url)
    } finally {
      $indicatorProgress = false
    }
  }

  const clearFilter = async () => {
    query = ''
    if (selectedCategories) {
      const lastCategory = selectedCategories[selectedCategories.length - 1]
      if (lastCategory?.url?.startsWith('/datasets')) {
        await handleSelectSubcategory(lastCategory)
        return
      }
    }

    DataItemFeatureCollection = undefined
    selectedCategories = []
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
    {#if selectedCategories && selectedCategories.length > 0}
      <nav
        class="breadcrumb has-succeeds-separator breadcrumb-margin"
        aria-label="breadcrumbs">
        <ul class="breadcrumb-margin">
          {#each selectedCategories as category, index}
            {#if index === 0}
              <li class="breadcrumb-margin">
                <!-- svelte-ignore a11y-missing-attribute -->
                <a
                  on:click={() => {
                    selectedCategories = []
                    subCategories = []
                    DataItemFeatureCollection = undefined
                    isShownSortbyButton = false
                  }}>{category.name}</a>
              </li>
            {:else if index === selectedCategories.length - 1}
              <!-- svelte-ignore a11y-missing-attribute -->
              <li class="breadcrumb-margin is-active"><a>{category.name}</a></li>
            {:else}
              <!-- svelte-ignore a11y-missing-attribute -->
              <li class="breadcrumb-margin">
                <a
                  on:click={() => {
                    let last = selectedCategories[selectedCategories.length - 1]
                    while (last.name !== category.name) {
                      selectedCategories.pop()
                      last = selectedCategories[selectedCategories.length - 1]
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
    <div
      class={`container mt-2 ${
        selectedCategories && selectedCategories.length === 0 ? 'category-container' : 'sub-category-container'
      }`}>
      {#if selectedCategories && selectedCategories.length === 0}
        {#each DataCategories as category}
          <DataCategoryCard
            bind:category
            size="medium"
            on:clicked={() => {
              handleSelectCategory(category)
            }} />
        {/each}
      {:else}
        {#each subCategories as category}
          <DataCategoryCard
            bind:category
            size="small"
            on:clicked={() => {
              handleSelectCategory(category)
            }} />
        {/each}
      {/if}
    </div>
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

    .category-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      grid-gap: 5px;
    }
    .sub-category-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      grid-gap: 5px;
    }
  }
</style>
