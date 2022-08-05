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
  import MapStyleCardList from '../../dashboards/components/MapStyleCardList.svelte'
  import DashboardCard from '../../dashboards/components/DashboardCard.svelte'
  import DashboardHeader from '../../dashboards/components/DashboardHeader.svelte'
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
  <MapStyleCardList />
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
</style>
