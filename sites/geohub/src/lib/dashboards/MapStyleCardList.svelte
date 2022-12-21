<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import DashboardMapStyleCard from './DashboardMapStyleCard.svelte'
  import type { DashboardMapStyle, Pages, StacLink } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import { Pagination, Loader } from '@undp-data/svelte-undp-design'

  const url: URL = $page.url

  let styleList: DashboardMapStyle[]
  let links: StacLink[]
  let pages: Pages
  let isLoading = false

  onMount(async () => {
    await updateStylePage('next')
  })

  const updateStylePage = async (type: 'next' | 'previous') => {
    try {
      isLoading = true
      let apiUrl = `${url.origin}/api/style`
      const link = links?.find((l) => l.rel === type)
      if (link) {
        apiUrl = link.href
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
</script>

<div class="align-center">
  <p class="title is-3">Saved maps</p>
</div>
{#if isLoading}
  <div class="align-center">
    <Loader />
  </div>
{:else if styleList && styleList.length > 0}
  <div class="grid">
    {#key styleList}
      {#each styleList as style}
        <DashboardMapStyleCard {style} />
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
  .align-center {
    width: max-content;
    margin: auto;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;

    @media (max-width: 400px) {
      grid-template-columns: 1fr;
    }

    @media (max-width: 820px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
