<script lang="ts">
  import { onMount } from 'svelte'
  import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { faChalkboardUser } from '@fortawesome/free-solid-svg-icons/faChalkboardUser'
  import Fa from 'svelte-fa'
  import StyleShare from './StyleShare.svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import LinearProgress from '@smui/linear-progress'
  import { indicatorProgress, layerList } from '$stores'

  export let drawerOpen = true
  $: hideLinearProgress = !$indicatorProgress
  let darkTheme: boolean

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
  <!-- {#if darkTheme === undefined}
    <link
      rel="stylesheet"
      href="/smui.css"
      media="(prefers-color-scheme: light)" />
    <link
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
  {:else} -->
  <link
    rel="stylesheet"
    href="/smui.css" />
  <!-- {/if} -->
</svelte:head>

<header class="country-header">
  <section class="header">
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
          <button
            class="menu-hamburger {drawerOpen ? 'is-active' : ''}"
            aria-label="menu-icon"
            on:click={() => (drawerOpen = !drawerOpen)}>
            <span class="hamburger-line line-top" />
            <span class="hamburger-line line-middle" />
            <span class="hamburger-line line-bottom" />
            Nav toggle
          </button>

          <div
            role="button"
            aria-label="UNDP Dashboards"
            class="menu-button"
            tabindex="0"
            on:click={() => window.open('/dashboards', '_blank')}
            on:keydown={onKeyPressed}>
            <Wrapper>
              <span class="icon">
                <i
                  class="fa-solid fa-chalkboard-user fa-xl"
                  style="color:#006eb5" />
              </span>
              <Tooltip
                showDelay={500}
                hideDelay={500}
                yPos="below">UNDP Dashboards</Tooltip>
            </Wrapper>
          </div>

          {#if $layerList.length > 0}
            <div
              class="menu-button"
              role="button"
              tabindex="0"
              aria-label="Share map">
              <Wrapper>
                <StyleShare />
                <Tooltip
                  showDelay={500}
                  hideDelay={500}
                  yPos="below">Share map</Tooltip>
              </Wrapper>
            </div>
          {/if}

          <div
            role="button"
            aria-label="Documentation"
            class="menu-button"
            tabindex="0"
            on:click={() => window.open('/docs/index.html', '_blank')}
            on:keydown={onKeyPressed}>
            <Wrapper>
              <span class="icon">
                <i
                  class="fa-regular fa-circle-question fa-xl"
                  style="color:#006eb5" />
              </span>
              <Tooltip
                showDelay={500}
                hideDelay={500}
                yPos="below">Documentation</Tooltip>
            </Wrapper>
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
  @use 'src/styles/undp-design/mobile-nav.min.css';
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
