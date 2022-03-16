<script lang="ts">
  import { onMount } from 'svelte'
  import { mdiWeatherSunny, mdiWeatherNight } from '@mdi/js'
  import { Icon } from '@smui/button'
  import { Svg } from '@smui/common/elements'
  import IconButton from '@smui/icon-button'
  import TopAppBar, { Row, Section, Title, AutoAdjust } from '@smui/top-app-bar'

  export let drawerOpen = true
  export let panelOpen = true

  let topAppBar: any
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

<TopAppBar bind:this={topAppBar} variant="fixed">
  <Row>
    <Section style="padding-left: 15px;">
      <img style="height: 52px;" src="1200px-UNDP_logo.svg-148x300.png" alt="GeoHub | UNDP" loading="lazy" />
      <Title style="font-family: ProximaNova, sans-serif; font-weight: bold;">GeoHub</Title>
    </Section>

    <Section align="end">
      <IconButton class="material-icons" on:click={() => (panelOpen = !panelOpen)}>bookmark_border</IconButton>
      <IconButton class="material-icons" on:click={() => (drawerOpen = !drawerOpen)}>menu</IconButton>
      <IconButton on:click={() => (darkTheme = !darkTheme)}>
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={darkTheme ? mdiWeatherSunny : mdiWeatherNight} />
        </Icon>
      </IconButton>
    </Section>
  </Row>
</TopAppBar>

<AutoAdjust {topAppBar} />
