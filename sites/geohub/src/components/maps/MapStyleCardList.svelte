<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import MapStyleCard from './MapStyleCard.svelte'
  import type { DashboardMapStyle, Pages, StacLink } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import { Pagination, Loader } from '@undp-data/svelte-undp-design'
  import { debounce } from 'lodash-es'
  import { AccessLevel, LimitOptions, MapOrderByOptions } from '$lib/constants'
  import AccessLevelSwitcher from '$components/AccessLevelSwitcher.svelte'

  let styles: { styles: DashboardMapStyle[]; links: StacLink[]; pages: Pages } = $page.data.styles

  let isLoading = false

  let limit = Number($page.url.searchParams.get('limit'))
  let offset = Number($page.url.searchParams.get('offset'))

  let query = $page.url.searchParams.get('query') ?? ''

  let accessLevel: AccessLevel = Number($page.url.searchParams.get('accesslevel')) as AccessLevel

  let expanded: { [key: string]: boolean } = {}
  let expandedStyleId: string
  $: {
    let expandedDatasets = Object.keys(expanded).filter((key) => expanded[key] === true && key !== expandedStyleId)
    if (expandedDatasets.length > 0) {
      expandedStyleId = expandedDatasets[0]
      Object.keys(expanded)
        .filter((key) => key !== expandedStyleId)
        .forEach((key) => {
          expanded[key] = false
        })
      expanded[expandedDatasets[0]] = true
    }
  }

  const normaliseQuery = () => {
    if (query.length > 0) {
      return query.trim().replace(/\s/g, ` and `)
    } else {
      return query
    }
  }

  $: isQueryEmpty = !query || query?.length === 0

  const getSortByFromUrl = (url: URL) => {
    const sortByValue = url.searchParams.get('sortby')
    if (sortByValue) {
      const option = MapOrderByOptions.find((opt) => opt.value === sortByValue)
      if (option) {
        return option.value
      }
    }
  }

  let sortby = getSortByFromUrl($page.url) ?? MapOrderByOptions[0].value

  const handleLimitChanged = async () => {
    const apiUrl = new URL($page.url.toString())
    const currentLimit = apiUrl.searchParams.get('limit') ? Number(apiUrl.searchParams.get('limit')) : undefined
    if (currentLimit && currentLimit !== limit) {
      offset = 0
      apiUrl.searchParams.set('offset', `${offset}`)
    }
    apiUrl.searchParams.set('limit', `${limit}`)

    await reload(apiUrl)
  }

  const handleSortbyChanged = async () => {
    offset = 0

    const apiUrl = new URL($page.url.toString())
    apiUrl.searchParams.set('offset', `${offset}`)
    apiUrl.searchParams.set('sortby', sortby)

    await reload(apiUrl)
  }

  const handleAccessLevelChanged = async () => {
    offset = 0

    const apiUrl = new URL($page.url.toString())
    apiUrl.searchParams.set('offset', `${offset}`)
    apiUrl.searchParams.set('accesslevel', `${accessLevel}`)

    await reload(apiUrl)
  }

  const reload = async (url: URL) => {
    try {
      isLoading = true
      await goto(`?${url.searchParams.toString()}`, {
        invalidateAll: true,
        noScroll: true,
      })
      styles = $page.data.styles
    } finally {
      isLoading = false
    }
  }

  const updateStylePage = async (type: 'next' | 'previous') => {
    const link = styles.links?.find((l) => l.rel === type)
    if (link) {
      const apiUrl = new URL(link.href)
      await reload(apiUrl)
    }
  }

  const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
    const type = e.detail.type
    await updateStylePage(type)
  }

  const handleStyleDeleted = (e) => {
    const deletedStyle: DashboardMapStyle = e.detail.style
    const index = styles.styles.map((s) => s.id).indexOf(deletedStyle.id)
    if (index !== -1) {
      styles.styles.splice(index, 1)
      styles.styles = [...styles.styles]
    }
  }

  const handleFilterInput = debounce(async (e) => {
    query = (e.target as HTMLInputElement).value
    let queryForSearch = query
    if (query.length > 0) {
      const apiUrl = new URL($page.url.toString())
      offset = 0
      apiUrl.searchParams.set('offset', `${offset}`)
      queryForSearch = normaliseQuery()
      if (queryForSearch && queryForSearch.length > 0) {
        apiUrl.searchParams.set('query', queryForSearch)
      }
      await reload(apiUrl)
    }
  }, 500)

  const clearInput = async () => {
    if (isQueryEmpty === true) return
    const apiUrl = new URL($page.url.toString())
    query = ''
    offset = 0
    apiUrl.searchParams.set('offset', `${offset}`)
    apiUrl.searchParams.delete('query')
    await reload(apiUrl)
  }
</script>

<div class="align-center">
  <p class="title is-3">Shared maps</p>
</div>
<div class="styles-header tile is-ancestor">
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

  {#if $page.data.session}
    <div class="tile is-parent">
      <div class="field">
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">Search maps shared to:</label>
        <AccessLevelSwitcher
          bind:accessLevel
          on:change={handleAccessLevelChanged} />
      </div>
    </div>
  {/if}

  <div class="tile is-parent">
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Order by:</label>
      <div class="select">
        <select
          bind:value={sortby}
          on:change={handleSortbyChanged}>
          {#each MapOrderByOptions as option}
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
        <select
          bind:value={limit}
          on:change={handleLimitChanged}>
          {#each LimitOptions as limit}
            <option value={limit}>{limit}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>

{#if isLoading}
  <div class="align-center">
    <Loader size="medium" />
  </div>
{:else if styles.styles && styles.styles.length > 0}
  {#key styles.styles}
    {#each styles.styles as style}
      <MapStyleCard
        {style}
        bind:isExpanded={expanded[style.id]}
        on:deleted={handleStyleDeleted} />
    {/each}
  {/key}

  <div class="align-center pt-2">
    <Pagination
      bind:totalPages={styles.pages.totalPages}
      bind:currentPage={styles.pages.currentPage}
      on:clicked={handlePaginationClicked} />
  </div>
{:else}
  <div class="p-4">
    <Notification type="info">No map found</Notification>
  </div>
{/if}

<style lang="scss">
  .align-center {
    width: max-content;
    margin: auto;
  }

  .styles-header {
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

  :global(.accordion-header) {
    padding-left: 1.5rem !important;
  }
</style>
