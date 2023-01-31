<script lang="ts">
  import { page } from '$app/stores'
  import MapStyleCardList from '$components/maps/MapStyleCardList.svelte'
  import { Header, Footer, Stats } from '@undp-data/svelte-undp-design'
  import type { HeaderLink, StatsCard } from '@undp-data/svelte-undp-design/package/interfaces'
  import UserAccount from '$components/UserAccount.svelte'
  import { footerItems } from '$lib/constants'
  import { createHeaderLinks } from '$lib/helper'

  let innerWidth: number
  $: isMobile = innerWidth < 768 ? true : false

  let headerHeight: number

  let links: HeaderLink[] = createHeaderLinks(['home', 'dashboard', 'userguide'])

  let stats: StatsCard[] = $page.data.stats
</script>

<svelte:window bind:innerWidth />

<svelte:head>
  <title>GeoHub | Maps</title>
</svelte:head>

<div class="header">
  <Header
    region="UNDP's one stop shop for spatial data and analytics"
    siteTitle="GeoHub Maps"
    url="https://geohub.data.undp.org"
    logoUrl="assets/undp-images/undp-logo-blue.svg"
    bind:height={headerHeight}
    isPositionFixed={true}
    bind:links>
    <div slot="custom-button">
      <UserAccount />
    </div>
  </Header>
</div>

<div
  class="main-section mb-4"
  style="margin-top: {headerHeight}px">
  {#if stats}
    <div class="tile">
      {#each stats as card}
        <div class="tile">
          <Stats
            bind:card
            size={isMobile ? 'large' : 'small'} />
        </div>
      {/each}
    </div>
    <div class="is-divider" />
  {/if}

  <MapStyleCardList />
</div>

<Footer
  logoUrl="assets/undp-images/undp-logo-white.svg"
  {footerItems} />

<style lang="scss">
  @import '../../styles/geohubstyle.scss';
  @import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css';
  @import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
  @import 'bulma-divider/dist/css/bulma-divider.min.css';

  .header {
    position: fixed;
    width: 100%;
    background-color: white;
    z-index: 99;
  }

  .main-section {
    padding-top: 1rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
</style>
