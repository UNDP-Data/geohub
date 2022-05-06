<script lang="ts" context="module">
  const modules = import.meta.glob('./*.svelte')

  let pages = []
  for (let page in modules) {
    console.log(page)
    let path = page.replace('.svelte', '').replace('./', '/')
    pages.push({
      title: path.substring(page.lastIndexOf('/')),
      link: `dashboards${path.includes('index') ? path.replace('index', '') : path}`,
    })
  }
</script>

<script lang="ts">
  import DashboardCard from '../../dashboards/components/DashboardCard.svelte'
  import DashboardHeader from '../../dashboards/components/DashboardHeader.svelte'
</script>

<div style="height: 100vh; width: 100%; overflow-y: auto;">
  <section class="hero is-primary is-medium">
    <DashboardHeader />
    <div class="hero-body">
      <p class="title" style="margin-bottom: 10px;">Gallery</p>
      <div style="width: 120px; height: 5px; background: grey; " />
    </div>
  </section>

  <div style="width: 100%; height: 40px; display: flex; align-items: center" />
  <div class="main-section">
    <div style="width: 90%; display: flex; flex-wrap: wrap; margin: auto">
      {#each pages as page}
        <DashboardCard bind:title={page.title} bind:link={page.link} />
      {/each}
    </div>
  </div>
  <footer style="background: #121212; margin-bottom: 0!important;" class="footer">
    <div class="content has-text-centered">
      <p>&copy UNDP 2022</p>
    </div>
  </footer>
</div>

<style>
  .hero-body {
    /*margin-top: 300px;*/
    background: darkslategrey;
    //border-bottom: 1px solid grey;
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
