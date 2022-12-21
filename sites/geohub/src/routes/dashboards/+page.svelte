<script lang="ts">
  import MapStyleCardList from '../../dashboards/components/MapStyleCardList.svelte'
  import { Header, Footer, FluidCarousel } from '@undp-data/svelte-undp-design'
  import type { CarouselContent } from '@undp-data/svelte-undp-design/interfaces'
  import { browser } from '$app/environment'

  let contents: CarouselContent[] = [
    {
      tag: 'Dashboard',
      imageUrl: 'assets/electricity-snapshot.png',
      title: 'GeoHub Electricity Dashboard',
      description:
        'This dashboard presented here are two raster layers that display the likelihood of full electrification for a given area: High Resolution Electricity Access (HREA) and Machine Learning (ML). These are created by the University of Michigan, used to support the 2030 Social Development Goal (SDG) 7: ensuring access to affordable, reliable, sustainable and modern energy for all.',
      linkName: 'Explore More',
      linkUrl: 'dashboards/electricity',
    },
  ]

  let headerHeight: number
</script>

<svelte:head>
  <title>GeoHub | Dashboards</title>
</svelte:head>

<Header
  region="UNDP's one stop shop for spatial data and analytics"
  siteTitle="GeoHub dashboards"
  url="https://geohub.data.undp.org"
  logoUrl="assets/undp-images/undp-logo-blue.svg"
  bind:height={headerHeight}>
  <div
    slot="menu-buttons"
    class="menu-buttons">
    <div
      class="has-tooltip-bottom"
      data-tooltip="Home">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <a
        role="button"
        aria-label="Home"
        class="menu-button has-tooltip-bottom"
        tabindex="0"
        href="/">
        <span class="icon">
          <i
            class="fa-solid fa-home"
            style="color:#006eb5" />
        </span>
      </a>
    </div>
  </div>
</Header>

<div
  style="height: calc(100vh - {headerHeight}px)!important; width: 100%; overflow-y: auto;overflow-x: hidden;margin-top: {headerHeight}px; ">
  <div class="main-section mb-4">
    {#if browser}
      <FluidCarousel bind:contents />
    {/if}
    <div class="is-divider" />
    <MapStyleCardList />
  </div>

  <Footer logoUrl="assets/undp-images/undp-logo-white.svg" />
</div>

<style lang="scss">
  @import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css';
  @import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
  @import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
  @import 'bulma-divider/dist/css/bulma-divider.min.css';

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
