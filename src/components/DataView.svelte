<script lang="ts">
  import type { DataCategory, StacItemFeatureCollection } from '$lib/types'
  import DataCategoryCard from './DataCategoryCard.svelte'
  import DataCard from './DataCard.svelte'

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
  }

  const handleSelectSubcategory = async (category: DataCategory) => {
    console.log(category)
    selectedCategories = [...selectedCategories, category]

    if (category.url.startsWith('/datasets')) {
      const res = await fetch(category.url)
      const json = await res.json()
      DataItemFeatureCollection = json
    }
    return category
  }
</script>

<div class="container data-view-container p-1">
  {#if selectedCategories && selectedCategories.length > 0}
    <nav
      class="breadcrumb has-succeeds-separator m-2"
      aria-label="breadcrumbs">
      <ul>
        {#each selectedCategories as category, index}
          {#if index === 0}
            <li>
              <a
                on:click={() => {
                  selectedCategories = []
                  DataItemFeatureCollection = undefined
                }}>{category.name}</a>
            </li>
          {:else if index === selectedCategories.length - 1}
            <li class="is-active"><a>{category.name}</a></li>
          {:else}
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
  .data-view-container {
    height: calc(100vh - 150px);
    overflow-y: auto;

    @media (max-width: 89.9375em) {
      height: calc(100vh - 120px);
    }
  }
</style>
