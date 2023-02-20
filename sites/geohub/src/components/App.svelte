<script lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl'
  import { Split } from '@geoffcox/svelte-splitter/src'
  import Header from '$components/Header.svelte'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import Map from '$components/Map.svelte'
  import Content from './Content.svelte'
  import { map as mapStore, indicatorProgress } from '$stores'

  let map: MaplibreMap
  let headerHeight: number
  let isMenuShown = true

  let innerWidth: number
  let innerHeight: number
  $: isMobile = innerWidth < 768
  $: splitHeight = innerHeight - headerHeight

  let initialPrimaryWidth = 360
  let minPrimaryWidth = `${initialPrimaryWidth}px`
  let minSecondaryWidth = '50%'
  let defaultsplitterSize = '10px'
  let widthPecent = 0
  let sidebarPosition = 'left' // Default Position of the sidebar

  let splitControl: Split
  let splitterSize = defaultsplitterSize

  $: innerWidth, resizeMap()
  $: innerHeight, resizeMap()

  $: if (map) {
    mapStore.update(() => map)
    // setSplitControl()
  }

  const setWidthPercent = () => {
    widthPecent = (initialPrimaryWidth / innerWidth) * 100
  }

  const resizeMap = () => {
    if (!map) return
    // repaintMap()
    map.resize()
  }

  const repaintMap = () => {
    if (!map) return
    map.triggerRepaint()
  }

  const setSplitControl = () => {
    if (!splitControl) return
    if (isMenuShown === true) {
      if (isMobile) {
        splitControl.setPercent(100)
        splitterSize = '0px'
      } else {
        const widthPecent = (initialPrimaryWidth / innerWidth) * 100
        setWidthPercent()
        splitControl.setPercent(widthPecent)
        splitterSize = defaultsplitterSize
      }
    } else {
      splitControl.setPercent(0)
      splitterSize = '0px'
    }
    repaintMap()
  }

  $: isMenuShown, opened()
  $: sidebarPosition, setWidths()
  const opened = () => {
    console.log(isMenuShown)
    setSplitControl()
  }

  const setWidths = () => {
    if (sidebarPosition === 'left') {
      minPrimaryWidth = `${initialPrimaryWidth}px`
      minSecondaryWidth = '50%'
    } else {
      minPrimaryWidth = `${innerWidth - initialPrimaryWidth}px`
      minSecondaryWidth = `${initialPrimaryWidth}px`
    }
    resizeMap()
    repaintMap()
  }
  const splitterChanged = () => {
    resizeMap()
  }

  $: if (splitControl) {
    setSplitControl()
  }

  $: console.log(minPrimaryWidth)
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight />
<!--<Split-->
<!--    class="header-splitter"-->
<!--    horizontal-->
<!--    splitterSize="0px"-->
<!--    initialPrimarySize="{headerHeight}px">-->
<!--    <div slot="primary" style="z-index: 99999">-->
<Header
  bind:drawerOpen={isMenuShown}
  bind:height={headerHeight} />
<!--    </div>-->
<!--    <div slot="secondary" class="split-container" style="height:{splitHeight}px;">-->
<div
  class="split-container"
  style="height:{splitHeight}px;">
  <Split
    initialPrimarySize={`${widthPecent}%`}
    minPrimarySize={isMenuShown ? `${minPrimaryWidth}` : '0px'}
    maxPrimaryWidth="50%"
    minSecondarySize={isMobile ? '0px' : minSecondaryWidth}
    {splitterSize}
    on:changed={splitterChanged}
    bind:this={splitControl}>
    <div
      slot="primary"
      class="secondary-content">
      {#if isMobile}
        <span
          class="span close-icon"
          on:click={() => {
            isMenuShown = false
          }}>
          <i
            class="fa-solid fa-circle-xmark fa-2x"
            style="color:#1c1c1c;" />
        </span>
      {/if}
      <Content
        bind:sidebarPosition
        bind:splitterHeight={splitHeight} />
    </div>
    <div
      slot="secondary"
      class="secondary-content">
      <Map bind:map />
    </div>
  </Split>
</div>

<!--</Split>-->
<style>
  :global(.header-splitter) {
    z-index: 99999;
  }
</style>
