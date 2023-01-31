<script lang="ts">
  import { Header, Footer, FluidCarousel } from '@undp-data/svelte-undp-design'
  import type { CarouselContent, HeaderLink } from '@undp-data/svelte-undp-design/package/interfaces'
  import { browser } from '$app/environment'
  import UserAccount from '$components/UserAccount.svelte'
  import { footerItems } from '$lib/constants'
  import { createHeaderLinks } from '$lib/helper'

  let headerHeight: number

  let contents: CarouselContent[] = [
    {
      tag: 'Dashboard',
      imageUrl: 'assets/electricity-snapshot.png',
      title: 'GeoHub Electricity Dashboard',
      description:
        'This dashboard presented here are two raster layers that display the likelihood of full electrification for a given area: High Resolution Electricity Access (HREA) and Machine Learning (ML). These are created by the University of Michigan, used to support the 2030 Social Development Goal (SDG) 7: ensuring access to affordable, reliable, sustainable and modern energy for all.',
      linkName: 'Open dashboard',
      linkUrl: 'dashboards/electricity',
    },
  ]

  let links: HeaderLink[] = createHeaderLinks(['home', 'maps', 'userguide'])
</script>

<svelte:head>
  <title>GeoHub | Dashboards</title>
</svelte:head>

<div class="header">
  <Header
    region="UNDP's one stop shop for spatial data and analytics"
    siteTitle="GeoHub Dashboards"
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
  {#if browser}
    <FluidCarousel bind:contents />
  {/if}
</div>

<Footer
  logoUrl="assets/undp-images/undp-logo-white.svg"
  {footerItems} />

<style lang="scss">
  @import '../../styles/geohubstyle.scss';
  @import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css';

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
