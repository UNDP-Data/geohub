<script lang="ts">
  import { onMount } from 'svelte'
  import type { TopAppBarComponentDev } from '@smui/top-app-bar'
  import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar'
  import Fa from 'svelte-fa'
  import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
  import Tooltip, { Wrapper } from '@smui/tooltip'

  export let drawerOpen = true

  let darkTheme: boolean
  let topAppBar: TopAppBarComponentDev

  onMount(() => {
    window.matchMedia('(prefers-color-scheme: light)')
  })
</script>

<svelte:head>
  {#if darkTheme === undefined}
    <link rel="stylesheet" href="../smui.css" media="(prefers-color-scheme: light)" />
    <link rel="stylesheet" href="../smui-dark.css" media="screen and (prefers-color-scheme: dark)" />
  {:else if darkTheme}
    <link rel="stylesheet" href="../smui.css" />
    <link rel="stylesheet" href="../smui-dark.css" media="screen" />
  {:else}
    <link rel="stylesheet" href="../smui.css" />
  {/if}
</svelte:head>

<TopAppBar bind:this={topAppBar} variant="fixed">
  <Row>
    <Section style="padding-left: 15px;">
      <img style="height: 52px;" src="../1200px-UNDP_logo.svg-148x300.png" alt="GeoHub | UNDP" loading="lazy" />
      <Title style="font-family: ProximaNova, sans-serif; font-weight: bold;">
        GeoHub
        <slot />
      </Title>
    </Section>

    <Section align="end">
      <Wrapper>
        <div class="icon" on:click={() => (drawerOpen = !drawerOpen)}>
          <Fa icon={faBars} size="lg" />
        </div>
        <Tooltip showDelay={500} hideDelay={500} yPos="below">
          {drawerOpen ? 'Hide Drawer' : 'Show Drawer'}
        </Tooltip>
      </Wrapper>
    </Section>
  </Row>
</TopAppBar>

<AutoAdjust {topAppBar} />

<style lang="scss">
  .icon {
    cursor: pointer;
    margin-right: 20px;
  }
</style>
