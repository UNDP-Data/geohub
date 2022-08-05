<script lang="ts" context="module">
  const modules = import.meta.glob('./*.svelte')

  let pages = []
  for (let page in modules) {
    let path = page.replace('.svelte', '').replace('./', '/')
    pages.push({
      title: path.substring(page.lastIndexOf('/')),
      link: `dashboards${path.includes('index') ? path.replace('index', '') : path}`,
    })
  }
</script>

<script lang="ts">
  import { Pagination } from 'carbon-components-svelte'
  import DashboardMapStyleCard from '../../dashboards/components/DashboardMapStyleCard.svelte'
  import DashboardCard from '../../dashboards/components/DashboardCard.svelte'
  import DashboardHeader from '../../dashboards/components/DashboardHeader.svelte'

  import { onMount } from 'svelte'

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

<div style="height: 100vh!important; width: 100%; overflow-y: auto;">
  <section class="hero is-primary is-medium">
    <DashboardHeader />
    <div class="hero-body">
      <p class="title" style="margin-bottom: 10px;">Gallery</p>
      <div style="width: 120px; height: 5px; background: grey; " />
    </div>
  </section>
  <div class="main-section">
    <div style="width: 90%; display: flex; flex-wrap: wrap; margin: auto;">
      {#each pages as page}
        <DashboardCard bind:title={page.title} bind:link={page.link} />
      {/each}
    </div>
  </div>
  {#if styleList && styleList.length > 0}
    <header class="card-header">
      <p class="card-header-title">Saved map styles</p>
    </header>
    <div class="sub-section">
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
  <footer style="background: #121212; margin-bottom: 0!important;" class="footer">
    <div class="content has-text-centered">
      <p>&copy UNDP 2022</p>
    </div>
  </footer>
</div>

<style lang="scss">
  @import 'carbon-components-svelte/css/white.css';

  .hero-body {
    background: darkslategrey;
  }
  .main-section {
    width: 100%;
    height: max-content;
    display: flex;
  }

  .sub-section {
    width: 100%;
    height: max-content;
    display: flex;
  }

  @media (prefers-color-scheme: dark) {
    .hero {
      background: #212125;
    }
    .main-section {
      background: #4a4a4a;
    }
    .footer {
      background: #121212 !important;
    }
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
