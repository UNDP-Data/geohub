<script lang="ts">
  import { onMount } from 'svelte'
  import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
  import { faChalkboardUser } from '@fortawesome/free-solid-svg-icons/faChalkboardUser'
  import Fa from 'svelte-fa'
  import StyleShare from '../StyleShare.svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { Section } from '@smui/top-app-bar'

  export let drawerOpen = true

  let darkTheme: boolean

  onMount(() => {
    window.matchMedia('(prefers-color-scheme: light)')
  })
</script>

<svelte:head>
  {#if darkTheme === undefined}
    <link rel="stylesheet" href="/smui.css" media="(prefers-color-scheme: light)" />
    <link rel="stylesheet" href="/smui-dark.css" media="screen and (prefers-color-scheme: dark)" />
  {:else if darkTheme}
    <link rel="stylesheet" href="/smui.css" />
    <link rel="stylesheet" href="/smui-dark.css" media="screen" />
  {:else}
    <link rel="stylesheet" href="/smui.css" />
  {/if}
</svelte:head>
<header class="header">
  <section>
    <div style="display: flex; justify-content: space-between; align-items: center">
      <div class="logo-div">
        <a href="https://undpgeohub.org" class="logo" tabIndex="0">
          <img style="height: 8vh;" src="undp-images/undp-logo-blue.svg" alt="GeoHub | UNDP" loading="lazy" />
        </a>
        <div class="site-title" style="margin-left: 5px">
          <span style="color: #232E3D" class="title">GeoHub</span>
        </div>
      </div>
      <div style="margin-right: 2%; width: fit-content; display: flex!important;">
        <div style="margin-left: 5%">
          <Wrapper>
            <div class="icon" on:click={() => window.open('/dashboards', '_blank')}>
              <Fa icon={faChalkboardUser} size="lg" />
            </div>
            <Tooltip showDelay={500} hideDelay={500} yPos="below">UNDP Dashboards</Tooltip>
          </Wrapper>
        </div>

        <div style="margin-left: 5%">
          <Wrapper>
            <StyleShare />
            <Tooltip showDelay={500} hideDelay={500} yPos="below">Download Map Style Specification</Tooltip>
          </Wrapper>
        </div>
        <div style="margin-left: 5%">
          <Wrapper>
            <div class="icon" on:click={() => (drawerOpen = !drawerOpen)}>
              <Fa icon={faBars} size="lg" />
            </div>
            <Tooltip showDelay={500} hideDelay={500} yPos="below">
              {drawerOpen ? 'Hide Drawer' : 'Show Drawer'}
            </Tooltip>
          </Wrapper>
        </div>
      </div>

      <!--      <div style="width:5%; display:flex; align-items:center; justify-content:space-evenly; margin-right: 5%;">-->
      <!--        <div class="icon" on:click={() => window.open('/dashboards', '_blank')}>-->
      <!--          <Fa style="color: #006EB5" class="fa-icon" icon={faChalkboardUser} size="lg" />-->
      <!--        </div>-->
      <!--          <StyleShare />-->
      <!--        <div class="icon" on:click={() => (drawerOpen = !drawerOpen)}>-->
      <!--            <Fa style="color: #006EB5" class="fa-icon" icon={faBars} size="lg" />-->
      <!--        </div>-->
      <!--      </div>-->
    </div>
  </section>
</header>
<!--<header class="country-header">-->
<!--  <section class="header">-->
<!--    <div class="grid-container fluid">-->
<!--      <div class="grid-x grid-margin-x align-content-middle">-->
<!--        <div class="cell large-9 small-9 align-self-middle top-left">-->
<!--          <a-->
<!--            href="https://develop.design-system.pages.dev/iframe?id=components-navigation-components-main-navigation-global-header&#45;&#45;global-header&amp;globals=locale:english&amp;args=&amp;viewMode=story"-->
<!--            class="logo"-->
<!--            tabindex="0"-->
<!--          >-->
<!--            <img-->
<!--              src="undp-images/undp-logo-blue.svg"-->
<!--              alt="UNDP Logo"-->
<!--            />-->
<!--          </a>-->
<!--          <div class="site-title">-->
<!--            GeoHub-->
<!--&lt;!&ndash;            <span>REGION</span>&ndash;&gt;-->
<!--&lt;!&ndash;            <span>Site Title</span>&ndash;&gt;-->
<!--          </div>-->
<!--        </div>-->
<!--        <div style='width: fit-content; margin-left: auto;'>-->
<!--          <div class="icon" on:click={() => window.open('/dashboards', '_blank')}>-->
<!--            <Fa style="color: #006EB5" class="fa-icon" icon={faChalkboardUser} size="lg" />-->
<!--          </div>-->
<!--          <StyleShare />-->
<!--          <div class="icon" on:click={() => (drawerOpen = !drawerOpen)}>-->
<!--            <Fa style="color: #006EB5" class="fa-icon" icon={faBars} size="lg" />-->
<!--          </div>-->
<!--&lt;!&ndash;          <ul class="align-right menu">&ndash;&gt;-->
<!--&lt;!&ndash;            <li>&ndash;&gt;-->
<!--&lt;!&ndash;              <a href="#0" on:click={() => window.open('/dashboards', '_blank')}>&ndash;&gt;-->
<!--&lt;!&ndash;              <Fa style="color: #006EB5" class="fa-icon" icon={faChalkboardUser} size="lg" />&ndash;&gt;-->
<!--&lt;!&ndash;              </a>&ndash;&gt;-->
<!--&lt;!&ndash;            </li>&ndash;&gt;-->
<!--&lt;!&ndash;            <li><StyleShare /></li>&ndash;&gt;-->
<!--&lt;!&ndash;            <li>&ndash;&gt;-->
<!--&lt;!&ndash;              <a href="#0">&ndash;&gt;-->
<!--&lt;!&ndash;                <Fa style="color: #006EB5" class="fa-icon" icon={faBars} size="lg" />&ndash;&gt;-->
<!--&lt;!&ndash;              </a>&ndash;&gt;-->
<!--&lt;!&ndash;            </li>&ndash;&gt;-->
<!--&lt;!&ndash;          </ul>&ndash;&gt;-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </section>-->

<!--</header>-->
<style lang="scss">
  @import '../../styles/undp-design/base-minimal.min';
  @import '../../styles/undp-design/country-site-header.min';

  $dark-azure: #00c1ff;
  .header {
    background-color: #f5f5f5;
    padding: 0;
    margin: 0;
    height: 8vh;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    .logo-div {
      display: flex;
      justify-content: left;
      align-items: center;
      margin-left: 1rem;
      max-width: fit-content;
    }
  }
  //:global(.icon) {
  //  cursor: pointer;
  //  margin-right: 10%;
  //}
  .fa-icon {
    color: $dark-azure;
  }
  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }
</style>
