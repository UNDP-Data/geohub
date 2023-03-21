<script lang="ts">
  import Settings from '$components/Settings.svelte'
  import { Header, type HeaderLink, Footer } from '@undp-data/svelte-undp-design'
  import UserAccount from '$components/UserAccount.svelte'
  import { HeaderItems, FooterItems } from '$lib/config/AppConfig'
  let headerHeight: number
  let links: HeaderLink[] = HeaderItems(['home', 'maps', 'data', 'dashboard', 'userguide'])
</script>

<div class="header">
  <Header
    region="UNDP's one stop shop for spatial data and analytics"
    siteTitle="GeoHub"
    url="https://geohub.data.undp.org"
    logoUrl="assets/undp-images/undp-logo-blue.svg"
    bind:height={headerHeight}
    bind:links
    isPositionFixed={true}>
    <div slot="custom-button">
      <UserAccount />
    </div>
  </Header>
</div>

<div
  class="main-section p-4"
  style="margin-top: {headerHeight}px">
  <Settings />
</div>

<Footer
  logoUrl="assets/undp-images/undp-logo-white.svg"
  footerItems={FooterItems} />

<style lang="scss">
  // Similar styles to the header as you can't set the z-index of the header at this place
  .header {
    position: fixed;
    z-index: 1000;
  }
</style>
