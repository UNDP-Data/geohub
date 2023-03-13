<script lang="ts">
  import type { PageData } from './$types'
  import MapStyleCardList from '$components/maps/MapStyleCardList.svelte'
  import { Header, Footer, Stats, type HeaderLink, type StatsCard } from '@undp-data/svelte-undp-design'
  import UserAccount from '$components/UserAccount.svelte'
  import { FooterItems, HeaderItems } from '$lib/config/AppConfig'

  export let data: PageData

  let innerWidth: number
  $: isMobile = innerWidth < 768 ? true : false

  let headerHeight: number

  let links: HeaderLink[] = HeaderItems(['home', 'dashboard', 'userguide'])

  let stats: StatsCard[] = data.stats

  let title = 'GeoHub | Maps'
</script>

<svelte:window bind:innerWidth />

<svelte:head>
  <title>{title}</title>
  <meta
    property="og:site_name"
    content={title} />
  <meta
    property="og:title"
    content={title} />
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
    <div class="grid is-flex {isMobile ? 'is-flex-direction-column' : 'is-flex-direction-row'}">
      {#each stats as card}
        <Stats
          bind:card
          size={isMobile ? 'medium' : 'small'} />
      {/each}
    </div>
    <div class="is-divider" />
  {/if}

  <MapStyleCardList />
</div>

<Footer
  logoUrl="assets/undp-images/undp-logo-white.svg"
  footerItems={FooterItems} />

<style lang="scss">
  .header {
    position: fixed;
    width: 100%;
    background-color: white;
    z-index: 99;

    :global(.menu-item) {
      margin: 0.75rem 1.75rem 0.75rem 0 !important;
    }
  }

  .main-section {
    padding-top: 1rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;

    .grid {
      margin: 0 auto;
      width: fit-content;

      :global(.stats-card) {
        margin: 5px;
      }
    }
  }
</style>
