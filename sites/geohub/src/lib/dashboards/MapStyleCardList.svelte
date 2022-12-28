<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import DashboardMapStyleCard from './DashboardMapStyleCard.svelte'
  import type { DashboardMapStyle, Pages, StacLink } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import { Pagination, Loader } from '@undp-data/svelte-undp-design'
  import { debounce } from 'lodash-es'

  const url: URL = $page.url

  let styleList: DashboardMapStyle[]
  let links: StacLink[]
  let pages: Pages
  let isLoading = false

  let limits = [5, 10, 25, 50, 100]
  let limit = $page.url.searchParams.get('limit') ? Number($page.url.searchParams.get('limit')) : 10
  let offset = $page.url.searchParams.get('offset') ? Number($page.url.searchParams.get('offset')) : 0

  let query = $page.url.searchParams.get('query') ?? ''

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

  let queryForSearch = normaliseQuery()
  $: isQueryEmpty = !query || query?.length === 0

  let orderbyOptions = [
    {
      value: 'updatedat,desc',
      label: 'Most recent',
    },
    {
      value: 'updatedat,asc',
      label: 'less recent',
    },
    {
      value: 'name,asc',
      label: 'A to Z',
    },
    {
      value: 'name,desc',
      label: 'Z to A',
    },
  ]

  const getSortByFromUrl = (url: URL) => {
    const sortByValue = url.searchParams.get('sortby')
    if (sortByValue) {
      const option = orderbyOptions.find((opt) => opt.value === sortByValue)
      if (option) {
        return option.value
      }
    }
  }

  let sortby = getSortByFromUrl($page.url) ?? orderbyOptions[0].value

  onMount(async () => {
    setPageUrl()
  })

  $: limit, handleLimitChanged()
  $: sortby, handleSortbyChanged()

  const handleLimitChanged = async () => {
    if (!browser) return
    const currentLimit = $page.url.searchParams.get('limit') ? Number($page.url.searchParams.get('limit')) : undefined
    if (currentLimit && currentLimit !== limit) {
      offset = 0
      links = []
    }
    await updateStylePage('next')
  }

  const handleSortbyChanged = async () => {
    if (!browser) return
    offset = 0
    links = []
    await updateStylePage('next')
  }

  const setPageUrl = () => {
    $page.url.searchParams.set('limit', `${limit}`)
    $page.url.searchParams.set('offset', `${offset}`)
    $page.url.searchParams.set('sortby', `${sortby}`)
    if (query && query.length > 0) {
      $page.url.searchParams.set('query', `${query}`)
    } else {
      $page.url.searchParams.delete('query')
    }
    if (browser) {
      goto(`?${$page.url.searchParams.toString()}`)
    }
  }

  const updateStylePage = async (type: 'next' | 'previous') => {
    try {
      isLoading = true

      let apiUrl = new URL(`${url.origin}/api/style`)
      if (queryForSearch && queryForSearch.length > 0) {
        apiUrl.searchParams.set('query', queryForSearch)
      }
      apiUrl.searchParams.set('limit', `${limit}`)
      apiUrl.searchParams.set('offset', `${offset}`)
      apiUrl.searchParams.set('sortby', `${sortby}`)

      const link = links?.find((l) => l.rel === type)
      if (link) {
        const newURL = new URL(link.href)
        limit = Number(newURL.searchParams.get('limit'))
        offset = Number(newURL.searchParams.get('offset'))
        sortby = getSortByFromUrl(newURL)
        apiUrl = new URL(link.href)
        setPageUrl()
      } else {
        setPageUrl()
      }
      const res = await fetch(apiUrl.toString())
      const json = await res.json()
      styleList = json.styles
      links = json.links
      pages = json.pages
    } finally {
      isLoading = false
    }
  }

  const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
    const type = e.detail.type
    await updateStylePage(type)
  }

  const handleStyleDeleted = (e) => {
    const deletedStyle: DashboardMapStyle = e.detail.style
    const index = styleList.map((s) => s.id).indexOf(deletedStyle.id)
    if (index !== -1) {
      styleList.splice(index, 1)
      styleList = [...styleList]
    }
  }

  const handleFilterInput = debounce(async (e) => {
    query = (e.target as HTMLInputElement).value
    queryForSearch = query
    if (query.length > 0) {
      queryForSearch = normaliseQuery()

      offset = 0
      links = []
      await updateStylePage('next')
    }
  }, 500)

  const clearInput = async () => {
    if (isQueryEmpty === true) return
    query = ''
    queryForSearch = ''
    offset = 0
    links = []
    await updateStylePage('next')
  }
</script>

<div class="align-center">
  <p class="title is-3">Saved maps</p>
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
  <div class="tile is-parent">
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Order by:</label>
      <div class="select">
        <select bind:value={sortby}>
          {#each orderbyOptions as option}
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
{:else if styleList && styleList.length > 0}
  {#key styleList}
    {#each styleList as style}
      <DashboardMapStyleCard
        {style}
        bind:isExpanded={expanded[style.id]}
        on:deleted={handleStyleDeleted} />
    {/each}
  {/key}

  <div class="align-center pt-2">
    <Pagination
      bind:totalPages={pages.totalPages}
      bind:currentPage={pages.currentPage}
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
