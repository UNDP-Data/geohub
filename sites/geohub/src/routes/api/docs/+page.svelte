<script lang="ts">
  import { page } from '$app/stores'
  import SwaggerUI from 'swagger-ui'
  import 'swagger-ui/dist/swagger-ui.css'
  import { createHeaderLinks } from '$lib/helper'
  import { Footer, Header, type HeaderLink } from '@undp-data/svelte-undp-design'
  import { footerItems } from '$lib/constants'
  import UserAccount from '$components/UserAccount.svelte'

  let headerHeight: number
  let swaggerElement: HTMLDivElement

  let links: HeaderLink[] = createHeaderLinks(['home', 'maps', 'dashboard', 'userguide'])

  const spec = $page.data.swagger

  $: if (swaggerElement) {
    SwaggerUI({
      url: spec,
      domNode: swaggerElement,
      deepLinking: true,
      presets: [SwaggerUI.presets.apis, SwaggerUI.SwaggerUIStandalonePreset],
    })
  }
</script>

<svelte:head>
  <title>Swagger UI | GeoHub</title>
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
  bind:this={swaggerElement}
  class="py-2"
  style="margin-top: {headerHeight}px" />

<Footer
  logoUrl="/assets/undp-images/undp-logo-white.svg"
  {footerItems} />

<style
  global
  lang="scss">
  @import '../../../styles/geohubstyle.scss';

  html {
    box-sizing: border-box;
    overflow: -moz-scrollbars-vertical;
    overflow-y: scroll;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  body {
    margin: 0;
    background: #fafafa;
  }

  :global(.version) {
    background-color: hsla(0, 0%, 96%, 0) !important;
  }
</style>
