<script lang="ts">
  import { page } from '$app/stores'
  import UserAccount from '$components/UserAccount.svelte'
  import { footerItems } from '$lib/constants'
  import { Footer, Header } from '@undp-data/svelte-undp-design'
</script>

<Header
  region="UNDP's one stop shop for spatial data and analytics"
  siteTitle="GeoHub dashboards"
  url="https://geohub.data.undp.org"
  logoUrl="assets/undp-images/undp-logo-blue.svg"
  isPositionFixed={false}>
  <div
    slot="menu-buttons"
    class="menu-buttons is-align-items-center">
    <div
      class="has-tooltip-bottom has-tooltip-arrow"
      data-tooltip="Home">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <a
        role="button"
        aria-label="Home"
        class="menu-button"
        tabindex="0"
        href="/">
        <span class="icon">
          <i
            class="fa-solid fa-home fa-xl"
            style="color:#006eb5" />
        </span>
      </a>
    </div>

    <div class="menu-button">
      <UserAccount />
    </div>
  </div>
</Header>

<div class="container mt-6 m-4">
  <p class="title is-4">Whoops! Something wrong!</p>
  <p class="subtitle is-5 has-text-justified pt-4">{$page.error.message}</p>
  <p class="subtitle is-5 has-text-justified">Please contact administrator.</p>
</div>

<Footer
  logoUrl="assets/undp-images/undp-logo-white.svg"
  {footerItems} />

<style
  global
  lang="scss">
  @import '../styles/geohubstyle.scss';
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

  .menu-buttons {
    display: flex;

    .menu-button {
      cursor: pointer;
      margin-left: 20px;
      margin-right: 5px;
    }
  }
</style>
