<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import type { DatasetFeatureCollection } from '$lib/types'
  import { Accordion, Pagination } from '@undp-data/svelte-undp-design'
  import { SortingColumns } from '$lib/constants'
  import { debounce } from 'lodash-es'

  let fc: DatasetFeatureCollection = $page.data.features
  let expanded: { [key: string]: boolean } = {}

  let limits = [5, 10, 25, 50, 100].map((n) => `${n}`)
  let limit = $page.url.searchParams.get('limit') ? $page.url.searchParams.get('limit') : '10'
  let offset = $page.url.searchParams.get('offset') ? $page.url.searchParams.get('offset') : '0'
  let sortby = $page.url.searchParams.get('sortby') ? $page.url.searchParams.get('sortby') : 'name,asc'
  let query = $page.url.searchParams.get('query') ?? ''
  $: isQueryEmpty = !query || query?.length === 0

  $: limit, handleLimitChanged()
  $: sortby, handleSortbyChanged()

  const reload = async (url: URL) => {
    await goto(`?${url.searchParams.toString()}`, {
      invalidateAll: true,
    })
    fc = $page.data.features
  }

  const handleFilterInput = debounce(async (e) => {
    query = (e.target as HTMLInputElement).value
    let queryForSearch = query
    if (query.length > 0) {
      queryForSearch = normaliseQuery()
      offset = '0'

      const link = fc.links.find((l) => l.rel === 'self')
      if (link) {
        const href = new URL(link.href)
        href.searchParams.set('query', queryForSearch)
        href.searchParams.set('offset', offset)
        await reload(href)
      }
    }
  }, 500)

  const normaliseQuery = () => {
    if (query.length > 0) {
      return query.trim().replace(/\s/g, ` and `)
    } else {
      return query
    }
  }

  const clearInput = async () => {
    if (isQueryEmpty === true) return
    query = ''
    offset = '0'
    const link = fc.links.find((l) => l.rel === 'self')
    if (link) {
      const href = new URL(link.href)
      href.searchParams.delete('query')
      href.searchParams.set('offset', offset)
      await reload(href)
    }
  }

  const handleLimitChanged = async () => {
    const currentLimit = $page.url.searchParams.get('limit') ? $page.url.searchParams.get('limit') : undefined
    if (currentLimit && currentLimit !== limit) {
      offset = '0'

      const link = fc.links.find((l) => l.rel === 'self')
      if (link) {
        const href = new URL(link.href)
        href.searchParams.set('limit', limit)
        href.searchParams.set('offset', offset)
        await reload(href)
      }
    }
  }

  const handleSortbyChanged = async () => {
    offset = '0'

    const link = fc.links.find((l) => l.rel === 'self')
    if (link) {
      const href = new URL(link.href)
      href.searchParams.set('sortby', sortby)
      href.searchParams.set('offset', offset)
      await reload(href)
    }
  }

  const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
    const type = e.detail.type

    const link = fc.links.find((l) => l.rel === type)
    if (link) {
      const href = new URL(link.href)
      await reload(href)
    }
  }
</script>

<p class="title align-center">Datasets</p>

<div class="datasets-header tile is-ancestor">
  <div class="tile is-parent">
    <div class="control has-icons-left filter-text-box">
      <input
        data-testid="filter-bucket-input"
        class="input"
        type="text"
        placeholder="Type keywords"
        on:input={handleFilterInput}
        bind:value={query} />
      <span class="icon is-small is-left">
        <i class="fas fa-search" />
      </span>
      {#if !isQueryEmpty}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span
          class="clear-button"
          on:click={clearInput}>
          <i class="fas fa-xmark sm" />
        </span>
      {/if}
    </div>
  </div>

  <div class="tile is-parent">
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Order by:</label>
      <div class="select">
        <select bind:value={sortby}>
          {#each SortingColumns as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="tile is-parent">
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Shown in:</label>
      <div class="select">
        <select bind:value={limit}>
          {#each limits as limit}
            <option value={limit}>{limit}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>

{#each fc.features as feature}
  <Accordion
    headerTitle={feature.properties.name}
    bind:isExpanded={expanded[feature.properties.id]}>
    <div
      slot="content"
      class="card-container px-4">
      <p class="title is-6">{feature.properties.name}</p>
    </div>
  </Accordion>
{/each}

<div class="align-center pt-2">
  <Pagination
    bind:totalPages={fc.pages.totalPages}
    bind:currentPage={fc.pages.currentPage}
    on:clicked={handlePaginationClicked} />
</div>

<style lang="scss">
  .align-center {
    width: max-content;
    margin: auto;
  }

  .datasets-header {
    width: fit-content;
    margin-left: auto;

    .filter-text-box {
      position: relative;
      height: 35px;
      width: 200px;
      margin-top: 33px;

      .clear-button {
        position: absolute;
        top: 0.5rem;
        right: 1rem;
        cursor: pointer;
      }
    }
  }
</style>
