<script lang="ts">
  import { page } from '$app/stores'
  import type { DataCategory, StacItemFeatureCollection } from '$lib/types'
  import DataCategoryCard from './DataCategoryCard.svelte'
  import DataCard from './DataCard.svelte'
  import { indicatorProgress } from '$stores'
  import TextFilter from './controls/TextFilter.svelte'
  import { indexOf } from 'lodash'
  import Notification from './controls/Notification.svelte'

  let containerDivElement: HTMLDivElement
  let selectedCategories: DataCategory[] = []
  const LIMIT = 25

  let categories: DataCategory[] = [
    {
      name: 'SDG',
      icon: '/sdgs/SDG Wheel_WEB.png',
      url: '/tags?key=sdg_goal',
    },
    {
      name: 'Climate change',
      icon: '/sdgs/13.png',
      url: '/datasets?sdg_goal=13',
    },
    {
      name: 'Microsoft Planetary',
      icon: 'fa-brands fa-microsoft',
      url: '/datasets?stac=microsoft-pc',
    },
    {
      name: 'pg_tileserv',
      icon: '/crunchy-spatial-logo.png',
      url: '/datasets?type=pgtileserv',
    },
    {
      name: 'martin',
      icon: '/maplibre.png',
      url: '/datasets?type=martin',
    },
  ]

  let subCategories: DataCategory[] = []

  let DataItemFeatureCollection: StacItemFeatureCollection

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

      const res = await fetch(category.url)
      const json = await res.json()
      const values: string[] = json[Object.keys(json)[0]]
      if (category.name === 'SDG') {
        selectedCategories = [...selectedCategories, category]

        const num_values: number[] = values.map((v) => Number(v)).sort((a, b) => a - b)
        subCategories = num_values.map((num) => {
          return {
            name: `SDG${num}`,
            icon: `/sdgs/${num}.png`,
            url: `/datasets?sdg_goal=${num}`,
          }
        })
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
      if (selectedCategories) {
        const lastCategory = selectedCategories[selectedCategories.length - 1]
        if (lastCategory?.name !== category.name) {
          selectedCategories = [...selectedCategories, category]
        }
      }

      if (category.url.startsWith('/datasets')) {
        const apiUrl = new URL(`${$page.url.origin}${category.url}`)
        apiUrl.searchParams.set('limit', LIMIT.toString())
        const res = await fetch(apiUrl.toString())
        const json = await res.json()
        DataItemFeatureCollection = json
      }
      return category
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

  const handleFilterInput = async (e) => {
    const query = e.detail.query

    try {
      $indicatorProgress = true

      const link = DataItemFeatureCollection?.links.find((link) => link.rel === 'self')
      let url = `${$page.url.origin}/datasets`
      if (link) {
        url = link.href
      }
      const apiUrl = new URL(url)
      if (query.length === 0) {
        apiUrl.searchParams.delete('query')
      } else {
        apiUrl.searchParams.set('query', query.trim())
      }
      apiUrl.searchParams.set('limit', LIMIT.toString())
      const res = await fetch(apiUrl.toString())
      if (!res.ok) return
      const json: StacItemFeatureCollection = await res.json()
      DataItemFeatureCollection = json
    } finally {
      $indicatorProgress = false
    }
  }

  const clearFilter = async () => {
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
  class="container data-view-container m-4"
  on:scroll={handleScroll}
  bind:this={containerDivElement}>
  {#if selectedCategories && selectedCategories.length > 0}
    <nav
      class="breadcrumb has-succeeds-separator"
      aria-label="breadcrumbs">
      <ul>
        {#each selectedCategories as category, index}
          {#if index === 0}
            <li>
              <!-- svelte-ignore a11y-missing-attribute -->
              <a
                on:click={() => {
                  selectedCategories = []
                  subCategories = []
                  DataItemFeatureCollection = undefined
                }}>{category.name}</a>
            </li>
          {:else if index === selectedCategories.length - 1}
            <!-- svelte-ignore a11y-missing-attribute -->
            <li class="is-active"><a>{category.name}</a></li>
          {:else}
            <!-- svelte-ignore a11y-missing-attribute -->
            <li>
              <a
                on:click={() => {
                  let last = selectedCategories[selectedCategories.length - 1]
                  while (last.name !== category.name) {
                    selectedCategories.pop()
                    last = selectedCategories[selectedCategories.length - 1]
                  }
                  DataItemFeatureCollection = undefined
                }}>{category.name}</a>
            </li>
          {/if}
        {/each}
      </ul>
    </nav>
  {/if}

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
      class={`${
        selectedCategories && selectedCategories.length === 0 ? 'category-container' : 'sub-category-container'
      }`}>
      {#if selectedCategories && selectedCategories.length === 0}
        {#each categories as category}
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
    height: calc(100vh - 188px);
    overflow-y: scroll;

    @media (max-width: 89.9375em) {
      height: calc(100vh - 158px);
    }

    .button {
      color: white !important;
    }

    .category-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 5px;
    }
    .sub-category-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 5px;
    }
  }
</style>
