<script lang="ts">
  import { onMount } from 'svelte'
  import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
  import { faChalkboardUser } from '@fortawesome/free-solid-svg-icons/faChalkboardUser'
  import Fa from 'svelte-fa'
  import StyleShare from '../StyleShare.svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import '../../styles/undp-design/variables.scss'

  export let drawerOpen = true

  let darkTheme: boolean
  let share: boolean

  const reactToEnter = (e: any) => {
    if (e.key === 'Enter') {
      e.target.click()
    }
  }

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
        <a style="background:none;" href="https://undpgeohub.org" class="logo" tabIndex="-1">
          <img style="height: 8vh;" src="undp-images/undp-logo-blue.svg" alt="GeoHub | UNDP" loading="lazy" />
        </a>
        <div class="site-title" style="margin-left: 5px">
          <span style="color: #232E3D" class="title">GeoHub</span>
        </div>
      </div>
      <div style="margin-right: 5%; width: fit-content; display: flex!important;">
        <div
          style="cursor: pointer"
          on:click={() => window.open('/dashboards', '_blank')}
          on:keydown={reactToEnter}
          tabindex="0">
          <Wrapper>
            <div style="margin-right: 20px!important;" class="icon">
              <Fa icon={faChalkboardUser} size="lg" />
            </div>
            <Tooltip showDelay={500} hideDelay={500} yPos="below">UNDP Dashboards</Tooltip>
          </Wrapper>
        </div>

        <div style="margin-left: 5%; cursor: pointer">
          <Wrapper>
            <StyleShare bind:share />
            <Tooltip showDelay={500} hideDelay={500} yPos="below">Download Map Style Specification</Tooltip>
          </Wrapper>
        </div>
        <div
          style="margin-left: 5%; cursor: pointer;"
          on:click={() => (drawerOpen = !drawerOpen)}
          on:keydown={reactToEnter}
          tabindex="0">
          <Wrapper>
            <div class="icon">
              <Fa icon={faBars} size="lg" />
            </div>
            <Tooltip showDelay={500} hideDelay={500} yPos="below">
              {drawerOpen ? 'Hide Drawer' : 'Show Drawer'}
            </Tooltip>
          </Wrapper>
        </div>
      </div>
    </div>
  </section>
</header>

<style lang="scss">
  @import 'src/styles/undp-design/base-minimal.min';
  @import 'src/styles/undp-design/country-site-header.min';
  @import 'src/styles/undp-design/variables.scss';

  //.bars-icon{
  //  background: $color-azure!important;
  //}

  .header {
    background-color: $color-gray-200;
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

  .fa-icon {
    color: $color-azure;
  }
  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }
</style>
