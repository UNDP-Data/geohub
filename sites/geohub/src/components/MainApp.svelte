<script lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl'
  import { Split } from '@geoffcox/svelte-splitter/src'
  import Header from '$components/Header.svelte'
  import BannerMessageControl from '$components/BannerMessageControl.svelte'
  import Map from '$components/Map.svelte'
  import Content from './Content.svelte'
  import { map as mapStore } from '$stores'

  let map: MaplibreMap
  let headerHeight: number
  let isMenuShown = true

  let innerWidth: number
  let innerHeight: number
  let initialPrimaryWidth = 355
  let minPrimaryWidth = '360px'
  let minSecondaryWidth = '50%'
  let defaultsplitterSize = '10px'
  let widthPecent = 0

  let splitControl: Split
  let splitterSize = defaultsplitterSize

  $: innerWidth, resizeMap()
  $: innerHeight, resizeMap()

  $: if (map) {
    mapStore.update(() => map)
    setSplitControl()
  }

  const setWidthPercent = () => {
    widthPecent = (initialPrimaryWidth / innerWidth) * 100
  }

  const resizeMap = () => {
    if (!map) return
    repaintMap()
    map.resize()
  }

  const repaintMap = () => {
    if (!map) return
    map.triggerRepaint()
  }

  const setSplitControl = () => {
    if (!splitControl) return
    if (isMenuShown === true) {
      setWidthPercent()
      splitControl.setPercent(widthPecent)
      splitterSize = defaultsplitterSize
    } else {
      splitControl.setPercent(0)
      splitterSize = '0px'
    }
    repaintMap()
  }

  $: isMenuShown, opened()
  const opened = () => {
    setSplitControl()
  }

  const splitterChanged = () => {
    repaintMap()

    if (isMenuShown !== true) {
      resizeMap()
    }
  }
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight />

<Header
  bind:drawerOpen={isMenuShown}
  bind:height={headerHeight} />

<div class="split-container">
  <Split
    initialPrimarySize={`${widthPecent}%`}
    minPrimarySize={isMenuShown ? `${minPrimaryWidth}` : '0px'}
    minSecondarySize={minSecondaryWidth}
    {splitterSize}
    on:changed={splitterChanged}
    bind:this={splitControl}>
    <div
      slot="primary"
      class="primary-content">
      <Content bind:headerHeight />
    </div>

    <div
      slot="secondary"
      class="secondary-content">
      <BannerMessageControl>
        <Map bind:map />
      </BannerMessageControl>
    </div>
  </Split>
</div>

<style lang="scss">
  .split-container {
    .primary-content {
      position: relative;
    }

    .secondary-content {
      position: relative;
    }
  }
</style>
