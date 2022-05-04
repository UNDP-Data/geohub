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
</script>

<Header>Dashboards</Header>
<div style="width: 100%; height: max-content; z-index: -1;">
  <h3 style="color:dodgerblue; margin: auto; width: 30%;" class="title is-3">GeoHub Dashboard Gallery</h3>
</div>
<div class="body-div">
  {#each pages as page}
    <DashboardCard title={page.title} link={page.link} />
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
</style>
