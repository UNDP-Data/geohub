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
  import Header from '../../components/Header.svelte'

  let title = 'Geohub Dashboard Gallery'
  let showControls = false
</script>

<Header bind:title bind:showControls />
<div class="body-div">
  {#each pages as page}
    <DashboardCard bind:title={page.title} bind:link={page.link} />
  {/each}
</div>

<style>
  .body-div {
    padding: 20px;
    height: 100vh;
    width: 100%;
    overflow-y: auto;
    display: flex;
  }
  @media (max-width: 600px) {
    .body-div {
      display: block;
    }
  }
  @media (prefers-color-scheme: dark) {
    .body-div {
      background: #121212;
    }
  }
</style>
