<script lang="ts">
  import DashboardHeader from '../../dashboards/components/DashboardHeader.svelte'
  import DashboardFooter from '../../dashboards/components/DashboardFooter.svelte'
  import MapStyleCardList from '../../dashboards/components/MapStyleCardList.svelte'
  import type { PageData } from './$types'
  import { CardWithImage } from '@undp-data/svelte-undp-design'

  let pages = [
    {
      title: 'Electricity',
      link: 'dashboards/electricity',
      image: 'electricity-snapshot.jpg',
      imageSize: [350, 200],
      description: 'GeoHub electricity dashboard',
    },
  ]

  export let data: PageData
</script>

<svelte:head>
  <title>GeoHub | Dashboards</title>
</svelte:head>

<div style="height: 100vh!important; width: 100%; overflow-y: auto;overflow-x: hidden">
  <DashboardHeader />
  <div style="background:linear-gradient(140deg, #FBC412, #00C1FF); margin-top: 8vh; height: 22vh">
    <div style="margin-left:5%; padding-top:2%">
      <p class="title">Dashboards Gallery</p>
      <div style="width: 120px; height: 5px; background: black; " />
    </div>
  </div>
  <div class="main-section">
    <div class="dashboard-list">
      {#each pages as page}
        <CardWithImage url={page.link}>
          <div slot="title">
            <h6>{page.title}</h6>
          </div>
          <div slot="image">
            <img
              style="width: {page.imageSize[0]}px; height: {page.imageSize[1]}px;"
              src={page.image}
              alt={page.image} />
          </div>
          <div slot="description">
            <h5>{page.description}</h5>
          </div>
        </CardWithImage>
      {/each}
    </div>
    {#if data}
      <hr />
      <MapStyleCardList
        bind:defaultPage={data.defaultPage}
        bind:defaultPageSize={data.defaultPageSize}
        bind:totalItemsCount={data.totalItemsCount}
        bind:totalPagesCount={data.totalPagesCount} />
    {/if}
  </div>
  <DashboardFooter />
</div>

<style lang="scss">
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
  @import '../../styles/undp-design/base-minimal.min.css';
  @import '../../styles/undp-design/fonts.css';
  @import '../../styles/undp-design/footer.min.css';

  .main-section {
    padding-top: 1rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
</style>
