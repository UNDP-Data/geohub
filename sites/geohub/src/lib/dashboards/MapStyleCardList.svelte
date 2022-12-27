<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import DashboardMapStyleCard from './DashboardMapStyleCard.svelte'
  import type { DashboardMapStyle, Pages, StacLink } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import { Pagination, Loader } from '@undp-data/svelte-undp-design'

  const url: URL = $page.url

  let styleList: DashboardMapStyle[]
  let links: StacLink[]
  let pages: Pages
  let isLoading = false

  let limits = [5, 10, 25, 50, 100]
  let limit = $page.url.searchParams.get('limit') ? Number($page.url.searchParams.get('limit')) : 10
  let offset = $page.url.searchParams.get('offset') ? Number($page.url.searchParams.get('offset')) : 0

  onMount(async () => {
    setPageUrl()
  })

  $: limit, reloadStyles()

  const reloadStyles = async () => {
    if (!browser) return
    const currentLimit = $page.url.searchParams.get('limit') ? Number($page.url.searchParams.get('limit')) : undefined
    if (currentLimit && currentLimit !== limit) {
      offset = 0
      links = []
    }
    await updateStylePage('next')
  }

  const setPageUrl = () => {
    $page.url.searchParams.set('limit', `${limit}`)
    $page.url.searchParams.set('offset', `${offset}`)
    if (browser) {
      goto(`?${$page.url.searchParams.toString()}`)
    }
  }

  const updateStylePage = async (type: 'next' | 'previous') => {
    try {
      isLoading = true

      let apiUrl = `${url.origin}/api/style?limit=${limit}&offset=${offset}`
      const link = links?.find((l) => l.rel === type)
      if (link) {
        const newURL = new URL(link.href)
        limit = Number(newURL.searchParams.get('limit'))
        offset = Number(newURL.searchParams.get('offset'))
        apiUrl = link.href
        setPageUrl()
      } else {
        setPageUrl()
      }
      const res = await fetch(apiUrl)
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
</script>

<div class="styles-header">
  <div class="align-center">
    <p class="title is-3">Saved maps</p>
  </div>
  <div class="align-right">
    <div class="select">
      <select bind:value={limit}>
        {#each limits as limit}
          <option value={limit}>{limit}</option>
        {/each}
      </select>
    </div>
  </div>
</div>

{#if isLoading}
  <div class="align-center">
    <Loader />
  </div>
{:else if styleList && styleList.length > 0}
  <div class="grid">
    {#key styleList}
      {#each styleList as style}
        <DashboardMapStyleCard
          {style}
          on:deleted={handleStyleDeleted} />
      {/each}
    {/key}
  </div>
  <div class="align-center">
    <Pagination
      bind:totalPages={pages.totalPages}
      bind:currentPage={pages.currentPage}
      on:clicked={handlePaginationClicked} />
  </div>
{:else}
  <Notification type="info">No map found</Notification>
{/if}

<style lang="scss">
  .styles-header {
    display: flex;
  }

  .align-center {
    width: max-content;
    margin: auto;
  }

  .aligh-right {
    width: max-content;
    margin-left: auto;
    display: flex;
  }

  .grid {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr;
  }
</style>
