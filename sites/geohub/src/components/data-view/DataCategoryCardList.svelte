<script lang="ts">
  import { page } from '$app/stores'
  import { createEventDispatcher } from 'svelte'
  import type { Breadcrumb } from '@undp-data/svelte-undp-design'
  import DataCategoryCard from '$components/data-view/DataCategoryCard.svelte'
  import { indicatorProgress } from '$stores'
  import { onMount } from 'svelte'

  const dispatch = createEventDispatcher()

  export let categories: Breadcrumb[]
  export let cardSize: 'medium' | 'small' = 'medium'
  export let breadcrumbs: Breadcrumb[]
  let subCategories: Breadcrumb[] = []
  $: isShowSubCategory = subCategories && subCategories.length > 0

  $: breadcrumbs, breadcrumbChanged()

  onMount(async () => {
    if (!(breadcrumbs && breadcrumbs.length > 0)) return
    const breadcrumbCount = breadcrumbs.length
    if (breadcrumbCount > 1) {
      const lastCategory = breadcrumbs[breadcrumbCount - 1]
      if (!lastCategory.url.startsWith('/api/datasets') && categories.find((c) => c.name === lastCategory.name)) {
        await getSelectedCategory(lastCategory)
      }
    }
  })

  const breadcrumbChanged = async () => {
    if (!(breadcrumbs && breadcrumbs.length > 0)) return
    const breadcrumbCount = breadcrumbs.length
    if (breadcrumbCount === 1) {
      subCategories = []
      isShowSubCategory = false
    }
  }

  const getSelectedCategory = async (category: Breadcrumb) => {
    if (category.name === 'SDG') {
      await searchCategory(category)
    } else {
      await handleSelectSubcategory(category)
    }
  }

  const searchCategory = async (category: Breadcrumb) => {
    try {
      $indicatorProgress = true

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
      subCategories = num_values.map((num) => {
        return {
          name: `SDG${num}`,
          icon: `assets/sdgs/${num}.png`,
          url: `/api/datasets?sdg_goal=${num}`,
        }
      })
    } finally {
      $indicatorProgress = false
    }
  }

  const handleSelectSubcategory = async (category: Breadcrumb) => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      const lastCategory = breadcrumbs[breadcrumbs.length - 1]
      if (lastCategory?.name !== category.name) {
        breadcrumbs = [...breadcrumbs, category]
      }
    }
    if (category.url.startsWith('/api/datasets')) {
      dispatch('selected', { category })
    }
  }

  const handleDatasetCategorySelected = (e) => {
    const category = e.detail.category
    dispatch('selected', { category })
  }
</script>

{#if isShowSubCategory}
  <svelte:self
    categories={subCategories}
    cardSize="small"
    bind:breadcrumbs
    on:selected={handleDatasetCategorySelected} />
{:else}
  <div
    class="container mt-2 category-container"
    style="grid-template-columns: repeat(auto-fit, minmax({cardSize === 'medium' ? 80 : 70}px, 1fr))">
    {#each categories as category}
      <DataCategoryCard
        bind:category
        size={cardSize}
        on:clicked={() => {
          getSelectedCategory(category)
        }} />
    {/each}
  </div>
{/if}

<style lang="scss">
  .category-container {
    display: grid;
    grid-gap: 5px;
  }
</style>
