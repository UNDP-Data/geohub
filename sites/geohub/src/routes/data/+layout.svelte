<script lang="ts">
  import { page } from '$app/stores'
  import { Header, Footer } from '@undp-data/svelte-undp-design'
  import type { HeaderLink } from '@undp-data/svelte-undp-design/package/interfaces'
  import UserAccount from '$components/UserAccount.svelte'
  import { footerItems } from '$lib/constants'
  import { createHeaderLinks } from '$lib/helper'

  let headerHeight: number

  let links: HeaderLink[] = createHeaderLinks(['home', 'userguide'])

  let title = 'GeoHub | Dashboards'
</script>

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
    siteTitle="GeoHub Data"
    url="https://geohub.data.undp.org"
    logoUrl="/assets/undp-images/undp-logo-blue.svg"
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
  {#if $page.data.session}
    <slot />
  {:else}
    <div class="container m-4">
      <p class="title is-4">403</p>
      <p class="subtitle is-5 has-text-justified pt-4">No permission to access this page. Please sign in.</p>
    </div>
  {/if}
</div>

<Footer
  logoUrl="/assets/undp-images/undp-logo-white.svg"
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
