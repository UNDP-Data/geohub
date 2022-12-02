<script lang="ts">
  import { onMount } from 'svelte'
  import StyleShare from './StyleShare.svelte'
  import LinearProgress from '@smui/linear-progress'
  import { indicatorProgress, layerList } from '$stores'

  export let drawerOpen = true
  export let height: number
  $: hideLinearProgress = !$indicatorProgress
  // let darkTheme: boolean

  const onKeyPressed = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }

  onMount(() => {
    window.matchMedia('(prefers-color-scheme: light)')
  })
</script>

<svelte:head>
  <!-- {#if darkTheme === undefined} -->
  <link
    rel="stylesheet"
    href="/smui.css"
    media="(prefers-color-scheme: light)" />
  <!-- <link
      rel="stylesheet"
      href="/smui-dark.css"
      media="screen and (prefers-color-scheme: dark)" />
  {:else if darkTheme}
    <link
      rel="stylesheet"
      href="/smui.css" />
    <link
      rel="stylesheet"
      href="/smui-dark.css"
      media="screen" />
  {:else}
  <link
    rel="stylesheet"
    href="/smui.css" />
  {/if} -->
</svelte:head>

<header class="country-header">
  <section
    class="header"
    bind:clientHeight={height}>
    <div class="grid-container fluid">
      <div class="grid-x grid-margin-x align-content-middle">
        <div class="cell large-9 small-9 align-self-middle top-left">
          <a
            href="https://undpgeohub.org"
            class="logo"
            tabindex="0">
            <img
              src="undp-images/undp-logo-blue.svg"
              alt="GeoHub | UNDP" />
          </a>
          <div class="site-title">
            <span>UNDP's one stop shop for spatial data and analytics</span>
            <span>GeoHub</span>
          </div>
        </div>
        <div class="cell large-3 small-3 top-right menu-buttons">
          <div
            role="button"
            aria-label="Layer panel"
            class="menu-button"
            tabindex="0"
            on:click={() => (drawerOpen = !drawerOpen)}
            on:keydown={onKeyPressed}>
            <span
              class="icon has-tooltip-bottom"
              data-tooltip={`${drawerOpen ? 'Hide' : 'Open'} layer panel`}>
              <i
                class="fa-solid {drawerOpen ? 'fa-xmark' : 'fa-bars'} fa-xl"
                style="color:#006eb5" />
            </span>
          </div>

          <div
            role="button"
            aria-label="UNDP Dashboards"
            class="menu-button"
            tabindex="0"
            on:click={() => window.open('/dashboards', '_blank')}
            on:keydown={onKeyPressed}>
            <span
              class="icon has-tooltip-bottom"
              data-tooltip="UNDP Dashboards">
              <i
                class="fa-solid fa-chalkboard-user fa-xl"
                style="color:#006eb5" />
            </span>
          </div>

          {#if $layerList.length > 0}
            <div
              class="menu-button"
              role="button"
              tabindex="0"
              aria-label="Share map">
              <StyleShare />
            </div>
          {/if}

          <div
            role="button"
            aria-label="Documentation"
            class="menu-button"
            tabindex="0"
            on:click={() => window.open('/docs/index.html', '_blank')}
            on:keydown={onKeyPressed}>
            <span
              class="icon has-tooltip-bottom"
              data-tooltip="Documentation">
              <i
                class="fa-regular fa-circle-question fa-xl"
                style="color:#006eb5" />
            </span>
          </div>
        </div>
      </div>
    </div>
    <LinearProgress
      indeterminate
      bind:closed={hideLinearProgress} />
  </section>
</header>

<style lang="scss">
  @use 'src/styles/undp-design/base-minimal.min.css';
  @use 'src/styles/undp-design/country-site-header.min.css';
  @use 'src/styles/undp-design/variables.scss';

  .menu-buttons {
    display: flex;

    .menu-button {
      cursor: pointer;
      margin-left: 20px;
      margin-right: 5px;
    }
  }
</style>
