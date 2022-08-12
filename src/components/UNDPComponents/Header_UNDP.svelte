<script lang="ts">
  import { onMount } from 'svelte'
  import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
  import { faChalkboardUser } from '@fortawesome/free-solid-svg-icons/faChalkboardUser'
  import Fa from 'svelte-fa'
  import { faX } from '@fortawesome/free-solid-svg-icons/faX'

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
      <div style="width:5%; display:flex; align-items:center; justify-content:space-evenly; margin-right: 2%;">
        <div class="icon" on:click={() => window.open('/dashboards', '_blank')}>
          <Fa style="color: #006EB5" class="fa-icon" icon={faChalkboardUser} size="lg" />
        </div>

        <div class="icon" on:click={() => (drawerOpen = !drawerOpen)}>
          {#if drawerOpen}
            <Fa style="color: #006EB5" class="fa-icon" icon={faX} size="lg" />
          {:else}
            <Fa style="color: #006EB5" class="fa-icon" icon={faBars} size="lg" />
          {/if}
        </div>
      </div>
    </div>
  </section>
</header>

<style lang="scss">
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
  .icon {
    cursor: pointer;
    margin-right: 10%;
  }
  .fa-icon {
    color: $dark-azure;
  }
  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }
</style>
