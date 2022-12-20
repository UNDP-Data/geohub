<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import DashboardMapStyleCard from '../../dashboards/components/DashboardMapStyleCard.svelte'
  import type { Pages, StacLink } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import { Pagination } from '@undp-data/svelte-undp-design'

  const url: URL = $page.url

  let styleList
  let links: StacLink[]
  let pages: Pages

  let previoustLink: StacLink
  let nextLink: StacLink

  onMount(async () => {
    await updateStylePage('next')
  })

  const updateStylePage = async (type: 'next' | 'previous') => {
    // const offset = page * pageSize - pageSize
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
    previoustLink = links?.find((l) => l.rel === 'previous')
    nextLink = links?.find((l) => l.rel === 'next')
  }

  const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
    const type = e.detail.type
    await updateStylePage(type)
  }
</script>

<div style="width: fit-content; margin:auto;">
  <h3>Saved Map Styles</h3>
</div>
{#if styleList && styleList.length > 0}
  <div
    class="content-card-container"
    style="margin-left: 10%; margin-right: 10%; margin-top: 5%; margin-bottom: 5%;">
    <div class="grid-x grid-margin-x small-up-1 medium-up-2 large-up-4 content-card-wrapper">
      {#key styleList}
        {#each styleList as style}
          <DashboardMapStyleCard {style} />
        {/each}
      {/key}
    </div>
  </div>
  <div class="pagination-container">
    <Pagination
      bind:totalPages={pages.totalPages}
      bind:currentPage={pages.currentPage}
      on:clicked={handlePaginationClicked} />
  </div>
{:else}
  <Notification type="info">No style saved</Notification>
{/if}

<style lang="scss">
  .pagination-container {
    width: max-content;
    margin: 0 auto;
  }
</style>
