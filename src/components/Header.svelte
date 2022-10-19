<script lang="ts">
  import { onMount } from 'svelte'
  import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
  import { faChalkboardUser } from '@fortawesome/free-solid-svg-icons/faChalkboardUser'
  import Fa from 'svelte-fa'
  import StyleShare from './StyleShare.svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'

  export let drawerOpen = true

  let darkTheme: boolean
  let share: boolean

  const onKeyPressed = (e: any) => {
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
<header class="country-header">
  <section class="header">
    <div class="grid-container fluid" style="display: flex; justify-content: space-between; align-items: center">
      <div class="cell large-9 small-9 align-self-middle top-left logo-div" aria-label="UNDP Logo">
        <a style="background:none;" href="https://undpgeohub.org" class="logo" tabIndex="-1">
          <img src="undp-images/undp-logo-blue.svg" alt="GeoHub | UNDP" loading="lazy" />
        </a>
        <div class="site-title" style="width: max-content">
          <span>UNDP's one stop shop for spatial data and analytics</span>
          <span>GeoHub</span>
        </div>
      </div>
      <div style="margin-right: 5%; width: fit-content; display: flex!important;">
        <div
          style="margin-left: 5%; margin-right: 20px; cursor: pointer"
          role="button"
          aria-label="Click to see the documentation">
          <div
            role="button"
            aria-label="Click to see the documentation"
            style="cursor: pointer"
            on:click={() => window.open('/docs/index.html', '_blank')}
            on:keydown={onKeyPressed}
            tabindex="1">
            <Wrapper>
              <div class="icon">
                <i class="fa-regular fa-circle-question fa-xl" />
              </div>
              <Tooltip showDelay={500} hideDelay={500} yPos="below">Click to see the documentation</Tooltip>
            </Wrapper>
          </div>
        </div>
        <div
          role="button"
          aria-label="Open GeoHub Dashboards"
          style="cursor: pointer"
          on:click={() => window.open('/dashboards', '_blank')}
          on:keydown={onKeyPressed}
          tabindex="1">
          <Wrapper>
            <div style="margin-right: 20px!important;" class="icon">
              <Fa icon={faChalkboardUser} size="lg" />
            </div>
            <Tooltip showDelay={500} hideDelay={500} yPos="below">UNDP Dashboards</Tooltip>
          </Wrapper>
        </div>

        <div style="margin-left: 5%; cursor: pointer" role="button" aria-label="Share the current style">
          <Wrapper>
            <StyleShare bind:share />
            <Tooltip showDelay={500} hideDelay={500} yPos="below">Download Map Style Specification</Tooltip>
          </Wrapper>
        </div>
        <div
          style="margin-left: 5%; cursor: pointer;"
          on:click={() => (drawerOpen = !drawerOpen)}
          on:keydown={onKeyPressed}
          tabindex="1"
          role="button"
          aria-label={drawerOpen ? 'Close side panel' : 'Open side panel'}>
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

  .logo-div {
    display: flex;
    justify-content: left;
    align-items: center;
    max-width: fit-content;
  }
</style>
