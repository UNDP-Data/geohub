<script lang="ts">
  import { page } from '$app/stores'
  import UserAccount from '$components/UserAccount.svelte'
  import { FooterItems } from '$lib/config/AppConfig'
  import { Footer, Header, type HeaderLink } from '@undp-data/svelte-undp-design'

  let links: HeaderLink[] = [
    {
      id: 'header-link-home',
      title: 'GeoHub home',
      href: '/',
      icon: 'fa-solid fa-home pr-1',
    },
    {
      id: 'header-link-documentation',
      title: 'User guide',
      href: '/docs/index.html',
      icon: 'fa-regular fa-circle-question pr-1',
    },
  ]
</script>

<Header
  region="UNDP's one stop shop for spatial data and analytics"
  siteTitle="GeoHub"
  url="https://geohub.data.undp.org"
  logoUrl="assets/undp-images/undp-logo-blue.svg"
  isPositionFixed={false}
  bind:links>
  <div slot="custom-button">
    <UserAccount />
  </div>
</Header>

<div class="container mt-6 m-4">
  <p class="title is-4">Whoops! Something wrong!</p>
  <p class="subtitle is-5 has-text-justified pt-4">{$page.error.message}</p>
  <p class="subtitle is-5 has-text-justified">Please contact administrator.</p>
</div>

<Footer
  logoUrl="assets/undp-images/undp-logo-white.svg"
  footerItems={FooterItems} />

<style
  global
  lang="scss">
  @import '../styles/geohubstyle.scss';
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

  :global(.menu-item) {
    margin: 0.75rem 1.75rem 0.75rem 0 !important;
  }
</style>
