<script lang="ts">
  import { Header } from '@undp-data/svelte-undp-design'
  import StyleShare from './StyleShare.svelte'
  import { indicatorProgress, layerList } from '$stores'
  import UserAccount from './UserAccount.svelte'

  export let drawerOpen = true
  export let height: number = undefined
  $: showProgressBar = $indicatorProgress

  const onKeyPressed = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }
</script>

<Header
  bind:height
  bind:showProgressBar
  region="UNDP's one stop shop for spatial data and analytics"
  siteTitle="GeoHub"
  url="https://geohub.data.undp.org"
  logoUrl="assets/undp-images/undp-logo-blue.svg"
  isPositionFixed={false}>
  <div
    slot="menu-buttons"
    class="menu-buttons is-align-items-center">
    <div
      class="has-tooltip-bottom has-tooltip-arrow"
      data-tooltip={`${drawerOpen ? 'Hide' : 'Open'} layer panel`}>
      <div
        role="button"
        aria-label="Layer panel"
        class="menu-button"
        tabindex="0"
        on:click={() => (drawerOpen = !drawerOpen)}
        on:keydown={onKeyPressed}>
        <span class="icon">
          <i
            class="fa-solid {drawerOpen ? 'fa-xmark' : 'fa-bars'} fa-xl"
            style="color:#006eb5" />
        </span>
      </div>
    </div>

    <div
      class="has-tooltip-bottom has-tooltip-arrow"
      data-tooltip="GeoHub Dashboards">
      <div
        role="button"
        aria-label="GeoHub Dashboards"
        class="menu-button has-tooltip-bottom has-tooltip-arrow"
        tabindex="0"
        on:click={() => window.open('/dashboards', '_blank')}
        on:keydown={onKeyPressed}>
        <span class="icon">
          <i
            class="fa-solid fa-chalkboard-user fa-xl"
            style="color:#006eb5" />
        </span>
      </div>
    </div>

    {#if $layerList.length > 0}
      <div
        class="has-tooltip-bottom has-tooltip-arrow"
        data-tooltip="Share map">
        <div
          class="menu-button"
          role="button"
          tabindex="0"
          aria-label="Share map">
          <StyleShare />
        </div>
      </div>
    {/if}

    <div
      class="has-tooltip-bottom has-tooltip-arrow"
      data-tooltip="Documentation">
      <div
        role="button"
        aria-label="Documentation"
        class="menu-button"
        tabindex="0"
        on:click={() => window.open('/docs/index.html', '_blank')}
        on:keydown={onKeyPressed}>
        <span class="icon has-tooltip-bottom has-tooltip-arrow">
          <i
            class="fa-regular fa-circle-question fa-xl"
            style="color:#006eb5" />
        </span>
      </div>
    </div>

    <div class="menu-button">
      <UserAccount />
    </div>
  </div>
</Header>

<style lang="scss">
  .menu-buttons {
    display: flex;

    .menu-button {
      cursor: pointer;
      margin-left: 20px;
      margin-right: 5px;
    }
  }
</style>
