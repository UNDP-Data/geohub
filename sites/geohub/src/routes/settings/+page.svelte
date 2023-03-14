<script lang="ts">
  import Settings from '$components/Settings.svelte'
  import { Header, type HeaderLink, Footer } from '@undp-data/svelte-undp-design'
  import UserAccount from '$components/UserAccount.svelte'
  import { HeaderItems, FooterItems } from '$lib/config/AppConfig'
  let headerHeight: number
  let links: HeaderLink[] = HeaderItems(['home', 'dashboard', 'userguide'])
</script>

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
<Settings bind:headerHeight />
<Footer
  logoUrl="assets/undp-images/undp-logo-white.svg"
  footerItems={FooterItems} />
