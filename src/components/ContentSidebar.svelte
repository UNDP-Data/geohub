<script lang="ts">
  import type { Map } from 'maplibre-gl'
  import { Split } from '@geoffcox/svelte-splitter/src'
  import { onMount } from 'svelte'

  export let map: Map
  export let isMenuShown = false
  let innerWidth: number
  let innerHeight: number
  let initialPrimaryWidth = 355
  let minPrimaryWidth = '355px'
  let minSecondaryWidth = '50%'
  let defaultsplitterSize = '10px'
  let widthPecent = 0

  let splitControl: Split
  let splitterSize = defaultsplitterSize

  $: innerWidth, resizeMap()
  $: innerHeight, resizeMap()

  onMount(() => {
    setSplitControl()
  })

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
      <slot name="primary" />
    </div>

    <div
      slot="secondary"
      class="secondary-content">
      <slot name="secondary" />
    </div>
  </Split>
</div>

<style lang="scss">
  .split-container {
    height: calc(100vh - 93.44px);
    margin-top: 93.44px;

    @media (max-width: 90em) {
      margin-top: 60.94px;
      height: calc(100vh - 60.94px);
    }

    .primary-content {
      position: relative;
    }

    .secondary-content {
      position: relative;
    }
  }
</style>
