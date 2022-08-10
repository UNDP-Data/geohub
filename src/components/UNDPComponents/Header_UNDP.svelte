<script lang="ts">
  import { onMount } from 'svelte'
  import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
  import Fa from 'svelte-fa'

  export let drawerOpen = true
  export let panelOpen = true

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
          <img style="height: 8vh;" src="1200px-UNDP_logo.svg-148x300.png" alt="GeoHub | UNDP" loading="lazy" />
        </a>
        <div class="site-title" style="margin-left: 5px">
          <span class="title">GeoHub</span>
        </div>
      </div>
      <div style="margin-right: 2%">
        <Fa icon={faBars} size="l" />
        <Fa icon={faBars} size="l" />
        <Fa icon={faBars} size="l" />
      </div>
    </div>
  </section>
</header>

<style lang="scss">
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
</style>
