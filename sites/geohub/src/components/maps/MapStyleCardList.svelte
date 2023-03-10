<script lang="ts">
  import { page } from '$app/stores'
  import { goto, invalidateAll } from '$app/navigation'
  import MapStyleCard from './MapStyleCard.svelte'
  import type { DashboardMapStyle, MapsData, Pages, StacLink } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import { Pagination, Loader } from '@undp-data/svelte-undp-design'
  import { debounce } from 'lodash-es'
  import AccessLevelSwitcher from '$components/AccessLevelSwitcher.svelte'
  import { AccessLevel, MapSortingColumns, LimitOptions } from '$lib/config/AppConfig'

  let promiseStyles: Promise<MapsData> = $page.data.promises.styles

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
      const option = MapSortingColumns.find((opt) => opt.value === sortByValue)
      if (option) {
        return option.value
      }
    }
  }

  let sortby = getSortByFromUrl($page.url) ?? MapSortingColumns[0].value

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
    promiseStyles = undefined
    await goto(`?${url.searchParams.toString()}`, {
      invalidateAll: true,
      noScroll: true,
    })
    promiseStyles = $page.data.promises.styles
  }

  const handlePaginationClicked = async (link: StacLink) => {
    const apiUrl = new URL(link.href)
    await reload(apiUrl)
  }

  const handleStyleDeleted = async () => {
    promiseStyles = undefined
    await invalidateAll()
    promiseStyles = $page.data.promises.styles
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
          {#each MapSortingColumns as option}
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

{#if !promiseStyles}
  <div class="align-center">
    <Loader size="medium" />
  </div>
{:else}
  {#await promiseStyles then styles}
    {#if styles.styles && styles.styles.length > 0}
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
          totalPages={styles.pages.totalPages}
          currentPage={styles.pages.currentPage}
          on:clicked={(e) => {
            const link = styles.links?.find((l) => l.rel === e.detail.type)
            if (!link) return
            handlePaginationClicked(link)
          }} />
      </div>
    {:else}
      <div class="p-4">
        <Notification type="info">No map found</Notification>
      </div>
    {/if}
  {/await}
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
