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

<!--<Header>Dashboards</Header>-->
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
    display: flex;
  }
  @media (max-width: 600px) {
    .body-div {
      display: block;
    }
  }
</style>
