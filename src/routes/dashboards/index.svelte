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
</script>

<div style="height: 100vh; width: 100%; overflow-y: scroll">
  <section class="hero is-medium is-link">
    <div class="hero-body">
      <div style="display: flex; align-items: center">
        <img style="height:80px; margin-right: 20px" src="1200px-UNDP_logo.svg-148x300.png" alt="UNDP Logo" />
        <p class="title">UNDP Dashboards Gallery</p>
      </div>
    </div>
  </section>
  <div class="main-section">
    <div style="width: 80%; display: flex; flex-wrap: wrap; margin: auto">
      {#each pages as page}
        <DashboardCard bind:title={page.title} bind:link={page.link} />
      {/each}
    </div>
  </div>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>&copy UNDP 2022</p>
    </div>
  </footer>
</div>

<style>
  .hero {
    background: dodgerblue;
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
