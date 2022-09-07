<script lang="ts">
  import { onMount } from 'svelte'
  import { Pagination } from 'carbon-components-svelte'
  import DashboardMapStyleCard from '../../dashboards/components/DashboardMapStyleCard.svelte'
  import 'carbon-components-svelte/css/all.css'
  import 'carbon-components-svelte/css/g100.css'
  import 'carbon-components-svelte/css/white.css'

  let styleList
  let totalItemsCount = -1
  let defaultPage = 1
  let defaultPageSize = 5

  onMount(async () => {
    const res = await fetch(`../style/count`)
    const json = await res.json()
    totalItemsCount = json.count

    await updateStylePage(defaultPage, defaultPageSize)
  })

  const handlePagination = async (e) => {
    const page = e.detail.page
    const pageSize = e.detail.pageSize
    await updateStylePage(page, pageSize)
  }

  const updateStylePage = async (page: number, pageSize: number) => {
    const offset = page * pageSize - pageSize
    const res = await fetch(`../style?limit=${pageSize}&offset=${offset}`)
    styleList = await res.json()
  }
</script>

{#if styleList && styleList.length > 0}
  <div style="width: fit-content; margin:auto;">
    <h3>Saved Map Styles</h3>
  </div>

  <div class="content-card-container" style="margin-left: 10%; margin-right: 10%; margin-top: 5%; margin-bottom: 5%;">
    <div class="grid-x grid-margin-x small-up-1 medium-up-2 large-up-4 content-card-wrapper">
      {#each styleList as style}
        <DashboardMapStyleCard {style} />
      {/each}
    </div>
  </div>
  {#if totalItemsCount > 1}
    <Pagination
      totalItems={totalItemsCount}
      pageSizes={[5, 10, 25, 50]}
      pageSize={defaultPageSize}
      page={defaultPage}
      on:update={handlePagination} />
  {/if}
{/if}

<style lang="scss">
</style>
