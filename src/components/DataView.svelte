<script lang="ts">
  import { page } from '$app/stores'
  import type { DataCategory, StacItemFeatureCollection } from '$lib/types'
  import DataCategoryCard from './DataCategoryCard.svelte'
  import DataCard from './DataCard.svelte'
  import { indicatorProgress } from '$stores'
  import TextFilter from './controls/TextFilter.svelte'

  let selectedCategories: DataCategory[] = []

  let categories: DataCategory[] = [
    {
      name: 'SDG',
      icon: '/sdgs/SDG Wheel_WEB.png',
      url: '/tags?key=sdg_goal',
    },
  ]

  let subCategories: DataCategory[] = []

  let DataItemFeatureCollection: StacItemFeatureCollection

  const handleSelectCategory = async (category: DataCategory) => {
    try {
      $indicatorProgress = true

      selectedCategories = [category]

      const res = await fetch(category.url)
      const json = await res.json()
      const values: string[] = json[Object.keys(json)[0]]
      if (category.name === 'SDG') {
        const num_values: number[] = values.map((v) => Number(v)).sort((a, b) => a - b)
        subCategories = num_values.map((num) => {
          return {
            name: `SDG${num}`,
            icon: `/sdgs/${num}.png`,
            url: `/datasets?sdg_goal=${num}`,
          }
        })
      }
    } finally {
      $indicatorProgress = false
    }
  }

  const handleSelectSubcategory = async (category: DataCategory) => {
    try {
      $indicatorProgress = true
      selectedCategories = [...selectedCategories, category]

      if (category.url.startsWith('/datasets')) {
        const res = await fetch(category.url)
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
      const res = await fetch(apiUrl.toString())
      if (!res.ok) return
      const json: StacItemFeatureCollection = await res.json()
      DataItemFeatureCollection = json
    } finally {
      $indicatorProgress = false
    }
  }

  const clearFilter = () => {
    DataItemFeatureCollection = undefined
    selectedCategories = []
  }
</script>

<TextFilter
  placeholder="Filter data"
  on:change={handleFilterInput}
  on:clear={clearFilter} />

<div class="container data-view-container p-1">
  {#if selectedCategories && selectedCategories.length > 0}
    <nav
      class="breadcrumb has-succeeds-separator m-2"
      aria-label="breadcrumbs">
      <ul>
        {#each selectedCategories as category, index}
          {#if index === 0}
            <li>
              <!-- svelte-ignore a11y-missing-attribute -->
              <a
                on:click={() => {
                  selectedCategories = []
                  DataItemFeatureCollection = undefined
                }}>{category.name}</a>
            </li>
          {:else if index === selectedCategories.length - 1}
            <!-- svelte-ignore a11y-missing-attribute -->
            <li class="is-active"><a>{category.name}</a></li>
          {:else}
            <!-- svelte-ignore a11y-missing-attribute -->
            <li><a>{category.name}</a></li>
          {/if}
        {/each}
      </ul>
    </nav>
  {/if}

  {#if DataItemFeatureCollection && DataItemFeatureCollection.features.length > 0}
    {#each DataItemFeatureCollection.features as feature}
      <DataCard {feature} />
    {/each}
    <div
      class="container p-2"
      style="text-align:center">
      {#if !$indicatorProgress && DataItemFeatureCollection?.links.find((link) => link.rel === 'next')}
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          class="button button-primary button-without-arrow"
          role="button"
          on:click={fetchNextDatasets}>
          Load more...
        </a>
      {/if}
    </div>
  {:else if DataItemFeatureCollection && DataItemFeatureCollection.features.length === 0}
    <div class="notification is-warning m-2">No data found</div>
  {:else}
    <div class="columns m-1 is-multiline is-centered category-container">
      {#if selectedCategories && selectedCategories.length === 0}
        {#each categories as category}
          <div
            class="column is-one-third m-0 p-1"
            on:click={() => {
              handleSelectCategory(category)
            }}>
            <DataCategoryCard
              bind:category
              size="medium" />
          </div>
        {/each}
      {:else}
        {#each subCategories as category}
          <div
            class="column is-3 -0 p-1"
            on:click={() => {
              handleSelectSubcategory(category)
            }}>
            <DataCategoryCard
              bind:category
              size="small" />
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../styles/undp-design/base-minimal.min.css';
  @use '../styles/undp-design/buttons.min.css';

  .data-view-container {
    height: calc(100vh - 183px);
    overflow-y: auto;

    @media (max-width: 89.9375em) {
      height: calc(100vh - 153px);
    }

    .button {
      color: white !important;
    }
  }
</style>
