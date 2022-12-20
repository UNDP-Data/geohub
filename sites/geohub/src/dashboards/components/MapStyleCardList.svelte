<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import DashboardMapStyleCard from '../../dashboards/components/DashboardMapStyleCard.svelte'
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
  <h3>Saved Map Styles</h3>
</div>
{#if isLoading}
  <div class="align-center">
    <Loader />
  </div>
{:else if styleList && styleList.length > 0}
  <div class="content-card-container">
    <div class="grid-x grid-margin-x small-up-1 medium-up-3 large-up-5 content-card-wrapper">
      {#key styleList}
        {#each styleList as style}
          <DashboardMapStyleCard {style} />
        {/each}
      {/key}
    </div>
  </div>
  <div class="align-center">
    <Pagination
      bind:totalPages={pages.totalPages}
      bind:currentPage={pages.currentPage}
      on:clicked={handlePaginationClicked} />
  </div>
{:else}
  <Notification type="info">No style saved</Notification>
{/if}

<style lang="scss">
  .align-center {
    width: max-content;
    margin: auto;
  }
</style>
