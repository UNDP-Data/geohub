<script lang="ts">
  import MapStyleCardList from '../../dashboards/components/MapStyleCardList.svelte'
  import type { PageData } from './$types'
  import { CardWithImage, Header, Footer } from '@undp-data/svelte-undp-design'

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
  let headerHeight: number
</script>

<svelte:head>
  <title>GeoHub | Dashboards</title>
</svelte:head>

<div style="height: 100vh!important; width: 100%; overflow-y: auto;overflow-x: hidden">
  <Header
    region="UNDP's one stop shop for spatial data and analytics"
    siteTitle="GeoHub dashboards"
    url="https://geohub.data.undp.org"
    logoUrl="undp-images/undp-logo-blue.svg"
    bind:height={headerHeight}>
    <div
      slot="menu-buttons"
      class="menu-buttons">
      <div
        class="has-tooltip-bottom"
        data-tooltip="Home">
        <div
          role="button"
          aria-label="Home"
          class="menu-button has-tooltip-bottom"
          tabindex="0"
          on:click={() => window.open('/', '_blank')}>
          <span class="icon">
            <i
              class="fa-solid fa-home"
              style="color:#006eb5" />
          </span>
        </div>
      </div>
    </div>
  </Header>

  <div style="background:linear-gradient(140deg, #FBC412, #00C1FF); margin-top: {headerHeight}px; height: 22vh">
    <div style="margin-left:5%; padding-top:2%">
      <p class="title">Dashboards Gallery</p>
      <div style="width: 120px; height: 5px; background: black; " />
    </div>
  </div>
  <div class="main-section">
    <div class="dashboard-list">
      {#each pages as page}
        <CardWithImage
          url={page.link}
          linkName="Open dashboard">
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

  <Footer logoUrl="undp-images/undp-logo-white.svg" />
</div>

<style lang="scss">
  @import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css';
  @import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
  @import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
  @import '../../styles/undp-design/base-minimal.min.css';

  .menu-buttons {
    display: flex;

    .menu-button {
      cursor: pointer;
      margin-left: 20px;
      margin-right: 5px;
    }
  }

  .main-section {
    padding-top: 1rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
</style>
