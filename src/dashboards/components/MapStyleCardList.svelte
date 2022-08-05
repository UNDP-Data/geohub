<script lang="ts">
  import { onMount } from 'svelte'
  import { Pagination } from 'carbon-components-svelte'
  import DashboardMapStyleCard from '../../dashboards/components/DashboardMapStyleCard.svelte'

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
  <header class="card-header">
    <p class="card-header-title">Saved map styles</p>
  </header>
  <div class="section">
    <div style="width: 90%; display: flex; flex-wrap: wrap; margin: auto;">
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
  .section {
    width: 100%;
    height: max-content;
    display: flex;
  }

  .card-header {
    margin-top: 20px;
    background: darkslategrey;
  }
  .card-header-title {
    font-family: ProximaNova, sans-serif;
    text-transform: capitalize;
    color: white;
    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }
</style>
