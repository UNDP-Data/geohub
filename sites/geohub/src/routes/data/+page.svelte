<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import type { DatasetFeatureCollection } from '$lib/types'
  import { Accordion, Pagination, Loader } from '@undp-data/svelte-undp-design'
  import { SortingColumns } from '$lib/constants'
  import { debounce } from 'lodash-es'
  import Notification from '$components/controls/Notification.svelte'
  import DataCardInfo from '$components/data-view/DataCardInfo.svelte'
  import { removeSasTokenFromDatasetUrl } from '$lib/helper'

  let fc: DatasetFeatureCollection = $page.data.features
  let expanded: { [key: string]: boolean } = {}
  let isLoading = false

  let limits = [5, 10, 25, 50, 100].map((n) => `${n}`)
  let limit = $page.url.searchParams.get('limit') ? $page.url.searchParams.get('limit') : '10'
  let offset = $page.url.searchParams.get('offset') ? $page.url.searchParams.get('offset') : '0'
  let sortby = $page.url.searchParams.get('sortby') ? $page.url.searchParams.get('sortby') : 'name,asc'
  let query = $page.url.searchParams.get('query') ?? ''
  $: isQueryEmpty = !query || query?.length === 0

  $: limit, handleLimitChanged()
  $: sortby, handleSortbyChanged()

  const reload = async (url: URL) => {
    try {
      isLoading = true
      await goto(`?${url.searchParams.toString()}`, {
        invalidateAll: true,
      })
      fc = $page.data.features
    } finally {
      isLoading = false
    }
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

  const gotoEditMetadataPage = (url: string) => {
    const url4edit = removeSasTokenFromDatasetUrl(url)
    goto(`/data/publish?url=${url4edit}`)
  }

  const gotoUploadPage = () => {
    goto(`/data/upload`)
  }
</script>

<p class="title align-center">Datasets</p>

<div class="datasets-header tile is-ancestor">
  <div class="tile is-parent">
    <button
      class="button is-primary upload-button"
      on:click={gotoUploadPage}>
      <span class="icon">
        <i class="fa-solid fa-cloud-arrow-up" />
      </span>
      <span>Data upload</span>
    </button>
  </div>

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

{#if isLoading}
  <div class="align-center">
    <Loader />
  </div>
{:else if fc.pages.totalCount > 0}
  {#each fc.features as feature}
    <Accordion
      headerTitle={feature.properties.name}
      bind:isExpanded={expanded[feature.properties.id]}>
      <div
        slot="content"
        class="columns pb-2">
        <div class="column is-10">
          <DataCardInfo bind:feature />
        </div>
        <div class="column is-2">
          <button
            class="button is-primary"
            on:click={() => {
              gotoEditMetadataPage(feature.properties.url)
            }}>
            <span class="icon">
              <i class="fa-solid fa-pen-to-square" />
            </span>
            <span>metadata</span>
          </button>
        </div>
      </div>
    </Accordion>
  {/each}

  <div class="align-center pt-2">
    <Pagination
      bind:totalPages={fc.pages.totalPages}
      bind:currentPage={fc.pages.currentPage}
      on:clicked={handlePaginationClicked} />
  </div>
{:else}
  <Notification
    type="info"
    showCloseButton={false}>No datasets found</Notification>
{/if}

<style lang="scss">
  .align-center {
    width: max-content;
    margin: auto;
  }

  .datasets-header {
    width: fit-content;
    margin-left: auto;

    .upload-button {
      margin-top: auto;
    }

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
