<script lang="ts">
  import Fa from 'svelte-fa'
  import { faHome } from '@fortawesome/free-solid-svg-icons/faHome'
</script>

<header class="country-header">
  <section class="header">
    <div class="grid-container fluid">
      <div class="grid-x grid-margin-x align-content-middle">
        <div class="cell large-9 small-9 align-self-middle top-left">
          <a
            href="https://develop.design-system.pages.dev/iframe?id=components-navigation-components-main-navigation-global-header--global-header&amp;globals=locale:english&amp;args=&amp;viewMode=story"
            class="logo"
            tabindex="0">
            <img src="undp-images/undp-logo-blue.svg" alt="UNDP Logo" />
          </a>
          <div class="site-title">
            <span>GeoHub</span>
            <span>Dashboards</span>
          </div>
        </div>
        <div
          title="Open GeoHub Web Application"
          class="cell large-3 small-3 top-right"
          style="cursor: pointer;"
          on:click={() => window.open('/')}>
          <Fa icon={faHome} />
        </div>
      </div>
    </div>
  </section>
</header>

<style lang="scss">
  @import '../../styles/undp-design/base-minimal.min.css';
  @import '../../styles/undp-design/country-site-header.min.css';
  @import '../../styles/undp-design/mobile-nav.min.css';
</style>
