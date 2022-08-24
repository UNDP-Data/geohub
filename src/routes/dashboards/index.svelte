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
  import DashboardCard from '../../dashboards/components/DashboardCard.svelte'
  import DashboardHeader from '../../dashboards/components/DashboardHeader.svelte'
  import DashboardFooter from '../../dashboards/components/DashboardFooter.svelte'
</script>

<div style="height: 100vh!important; width: 100%; overflow-y: auto;overflow-x: hidden">
  <DashboardHeader />
  <div style="background:linear-gradient(140deg, #FBC412, #00C1FF); margin-top: 8vh; height: 22vh">
    <div style="margin-left:5%; padding-top:2%">
      <p class="title">Dashboards Gallery</p>
      <div style="width: 120px; height: 5px; background: black; " />
    </div>
  </div>
  <div class="main-section" style="height: max-content; min-height: 60vh">
    <div
      class="grid-x small-up-2 medium-up-4 large-up-6 content-card-wrapper"
      style="width: 100%; margin-left: 2%; margin-right: 2%">
      {#each pages as page}
        <DashboardCard bind:title={page.title} bind:link={page.link} />
      {/each}
    </div>
  </div>
  <DashboardFooter />
</div>

<style lang="scss">
  @import '../../styles/undp-design/base-minimal.min.css';
  @import '../../styles/undp-design/fonts.css';
  .cell {
    width: 20%;
    height: 100px;
    background: red;
    margin-top: 2%;
  }
</style>
