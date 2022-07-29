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
  import DashboardMapStyleCard from '../../dashboards/components/DashboardMapStyleCard.svelte'
  import DashboardCard from '../../dashboards/components/DashboardCard.svelte'
  import DashboardHeader from '../../dashboards/components/DashboardHeader.svelte'

  import { onMount } from 'svelte'

  let styleList

  onMount(async () => {
    const res = await fetch('../style')
    styleList = await res.json()
  })
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
  {/if}
  <footer style="background: #121212; margin-bottom: 0!important;" class="footer">
    <div class="content has-text-centered">
      <p>&copy UNDP 2022</p>
    </div>
  </footer>
</div>

<style lang="scss">
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
