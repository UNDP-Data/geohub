<script lang="ts">
  import { onMount } from 'svelte'
  import { Map } from 'maplibre-gl'
  import { map } from '../stores'

  export let styles = []
  let maps = []
  let activeStyle
  let mainContainerId = 'main-switch-container'
  let showStyleSelection = false
  $: activeStyle, setActive()

  const updateMainContainerMap = (uri) => {
    new Map({
      container: mainContainerId,
      style: uri,
      center: [36.975, -1.364],
      zoom: 1,
      attributionControl: false,
      interactive: false,
    })
  }

  onMount(() => {
    styles.forEach((style) => {
      const _map = new Map({
        container: style.title,
        style: style.uri,
        center: [36.975, -1.364],
        zoom: 1,
        attributionControl: false,
        interactive: false,
      })
      maps.push(_map)

      if (style.active === true) {
        updateMainContainerMap(style.uri)
      }
    })
  })

  const setActive = () => {
    if (!activeStyle) return
    styles.forEach((s) => {
      s.active = s.title === activeStyle.title
    })
  }

  const changeStyle = (title) => {
    if (!$map) return
    styles.forEach((s) => {
      if (s.title === title) {
        activeStyle = JSON.parse(JSON.stringify(s))
      }
    })
    $map.setStyle(activeStyle.uri)
    setActive()
    updateMainContainerMap(activeStyle.uri)
    showStyleSelection = false
  }
</script>

<div
  class="main-switch-container"
  on:mouseenter={() => {
    showStyleSelection = true
  }}
  on:mouseleave={() => {
    showStyleSelection = false
  }}>
  <div
    class="map-button"
    id={mainContainerId}
    on:click={() => {
      showStyleSelection = !showStyleSelection
    }} />

  <div class="style-selection-container" class:visible={showStyleSelection}>
    {#each styles as style}
      <div
        class="map-button map-selectionn"
        id={style.title}
        on:click={() => {
          changeStyle(style.title)
        }} />
    {/each}
  </div>
</div>

<style lang="scss">
  .main-switch-container {
    position: absolute;
    bottom: 40px;
    left: 10px;
  }

  .map-button {
    cursor: pointer;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    margin: 5px;
    border-style: solid;
    border-color: #1c1c1c;
    border-width: 1px;
  }

  .style-selection-container {
    position: absolute;
    bottom: 65px;
    left: 0px;
    display: inline-flex;
    visibility: hidden;
  }

  .visible {
    visibility: visible;
  }

  .map-selectionn:hover {
    border-color: #e7aa70;
    border-width: 2px;
  }
</style>
