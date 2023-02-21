<script lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl'
  import { Split } from '@geoffcox/svelte-splitter/src'
  import Header from '$components/Header.svelte'
  import { map as mapStore } from '$stores'
  export let map: MaplibreMap
  export let isMenuShown = true
  export let initialSideBarWidth = 360
  export let minSideBarWidth = `${initialSideBarWidth}px`
  export let minMapWidth = '50%'
  export let sideBarPosition = 'left'

  let innerWidth: number
  let innerHeight: number
  let headerHeight: number
  let defaultsplitterSize = '10px'
  let widthPecent = 0
  let splitControl: Split
  let splitterSize = defaultsplitterSize
  let minPrimaryWidth = sideBarPosition === 'left' ? minSideBarWidth : minMapWidth
  let minSecondaryWidth = sideBarPosition === 'left' ? minMapWidth : minSideBarWidth

  $: isMobile = innerWidth < 768
  $: splitHeight = innerHeight - headerHeight
  $: innerWidth, resizeMap()
  $: innerHeight, resizeMap()

  const setWidthPercent = () => {
    widthPecent = (initialSideBarWidth / innerWidth) * 100
  }

  const resizeMap = () => {
    if (!$mapStore) {
      return
    }
    $mapStore.resize()
  }

  const repaintMap = () => {
    if (!$mapStore) return
    $mapStore.triggerRepaint()
  }

  const setSplitControl = () => {
    if (!splitControl) return
    if (isMenuShown === true) {
      if (isMobile) {
        if (sideBarPosition === 'left') {
          splitControl.setPercent(100)
          minSecondaryWidth = '0px'
        } else {
          splitControl.setPercent(0)
          minPrimaryWidth = '0px'
        }
        splitterSize = '0px'
      } else {
        if (sideBarPosition === 'left') {
          minPrimaryWidth = minSideBarWidth
          minSecondaryWidth = minMapWidth
          const widthPecent = (initialSideBarWidth / innerWidth) * 100
          splitControl.setPercent(widthPecent)
        } else {
          minSecondaryWidth = minSideBarWidth
          minPrimaryWidth = minMapWidth
          const widthPecent = ((innerWidth - initialSideBarWidth) / innerWidth) * 100
          splitControl.setPercent(widthPecent)
        }
        splitterSize = '10px'
        splitControl
      }
    } else {
      if (sideBarPosition === 'left') {
        minPrimaryWidth = '0px'
        splitControl.setPercent(0)
      } else {
        minSecondaryWidth = '0px'
        splitControl.setPercent(100)
      }
      splitterSize = '0px'
    }
    resizeMap()
  }

  const setWidths = () => {
    minPrimaryWidth = sideBarPosition === 'left' ? minSideBarWidth : minMapWidth
    minSecondaryWidth = sideBarPosition === 'left' ? minMapWidth : minSideBarWidth
  }

  $: isMenuShown, opened()

  $: sideBarPosition, setWidths()

  $: if (splitControl) {
    setSplitControl()
  }
  const opened = () => {
    setSplitControl()
  }
  const splitterChanged = () => {
    resizeMap()
  }
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight />
<Header
  bind:drawerOpen={isMenuShown}
  bind:height={headerHeight} />
<div
  class="split-container"
  style="height:{splitHeight}px;">
  <Split
    initialPrimarySize="0%"
    bind:minPrimarySize={minPrimaryWidth}
    bind:minSecondarySize={minSecondaryWidth}
    bind:splitterSize
    on:changed={splitterChanged}
    bind:this={splitControl}>
    <div
      slot="primary"
      class="primary-content">
      {#if sideBarPosition === 'left'}
        {#if isMobile}
          <span
            class="span close-icon"
            on:click={() => {
              isMenuShown = false
            }}>
            <i
              class="fa-solid fa-circle-xmark fa-2x"
              style="color:#1c1c1c;" /></span>
        {/if}
        <slot name="sidebar" />
      {:else}
        <slot name="map" />
      {/if}
    </div>
    <div
      slot="secondary"
      class="secondary-content">
      {#if sideBarPosition === 'left'}
        <slot name="map" />
      {:else}
        {#if isMobile}
          <span
            class="span close-icon"
            on:click={() => {
              isMenuShown = false
            }}>
            <i
              class="fa-solid fa-circle-xmark fa-2x"
              style="color:#1c1c1c;" /></span>
        {/if}
        <slot name="sidebar" />
      {/if}
    </div>
  </Split>
</div>
