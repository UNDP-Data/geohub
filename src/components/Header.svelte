<script lang="ts">
  import { onMount } from 'svelte'
  import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar'
  import Fa from 'svelte-fa'
  import { faBookmark } from '@fortawesome/free-regular-svg-icons/faBookmark'
  import { faMoon } from '@fortawesome/free-regular-svg-icons/faMoon'
  import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
  import { faSun } from '@fortawesome/free-solid-svg-icons/faSun'
  import Tooltip, { Wrapper } from '@smui/tooltip'

  import StyleDownloader from '$components/StyleDownloader.svelte'

  export let drawerOpen = true
  export let panelOpen = true
  export let title = 'GeoHub'
  export let showControls = true

  let darkTheme: boolean
  let topAppBar: any

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

<TopAppBar bind:this={topAppBar} variant="fixed">
  <Row>
    <Section style="padding-left: 15px;">
      <img style="height: 52px;" src="1200px-UNDP_logo.svg-148x300.png" alt="GeoHub | UNDP" loading="lazy" />
      <Title style="font-family: ProximaNova, sans-serif; font-weight: bold;">{title}</Title>
    </Section>
    {#if showControls}
      <Section align="end">
        <Wrapper>
          <StyleDownloader />
          <Tooltip showDelay={500} hideDelay={500} yPos="below">Download Map Style Specification</Tooltip>
        </Wrapper>
        <div class="icon" on:click={() => (panelOpen = !panelOpen)} style="display: none;">
          <Fa icon={faBookmark} size="lg" />
        </div>
        <Wrapper>
          <div class="icon" on:click={() => (drawerOpen = !drawerOpen)}>
            <Fa icon={faBars} size="lg" />
          </div>
          <Tooltip showDelay={500} hideDelay={500} yPos="below">
            {drawerOpen ? 'Hide Drawer' : 'Show Drawer'}
          </Tooltip>
        </Wrapper>
        <div class="icon" on:click={() => (darkTheme = !darkTheme)} style="display: none;">
          {#if darkTheme}
            <Fa icon={faSun} size="lg" />
          {:else}
            <Fa icon={faMoon} size="lg" />
          {/if}
        </div>
      </Section>
    {/if}
  </Row>
</TopAppBar>

<AutoAdjust {topAppBar} />

<style lang="scss">
  .icon {
    cursor: pointer;
    margin-right: 20px;
  }
</style>
