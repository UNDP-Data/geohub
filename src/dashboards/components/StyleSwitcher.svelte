<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { Map } from 'maplibre-gl'
  import { map } from '../stores'

  const dispatch = createEventDispatcher()

  export let styles = []
  let activeStyle
  let mainContainerId = 'main-switch-container'
  let showStyleSelection = false

  const createMap = (id, uri) => {
    return new Map({
      container: id,
      style: uri,
      center: [36.975, -1.364],
      zoom: 1,
      attributionControl: false,
      interactive: false,
    })
  }

  onMount(() => {
    styles.forEach((style) => {
      createMap(style.title, style.uri)
      if (style.active === true) {
        createMap(mainContainerId, style.uri)
      }
    })
  })

  const changeStyle = (title) => {
    if (!$map) return
    styles.forEach((s) => {
      s.active = s.title === title
      if (s.active) {
        activeStyle = JSON.parse(JSON.stringify(s))
      }
    })
    $map.setStyle(activeStyle.uri)
    createMap(mainContainerId, activeStyle.uri)
    showStyleSelection = false
    dispatch('styleChanged', {
      style: activeStyle,
    })
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
      <Wrapper>
        <div
          class="map-button map-selectionn"
          id={style.title}
          on:click={() => {
            changeStyle(style.title)
          }} />
        <Tooltip>{style.title}</Tooltip>
      </Wrapper>
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
    margin: 0px;
    border-style: solid;
    border-color: #1c1c1c;
    border-width: 1px;
  }

  .style-selection-container {
    position: absolute;
    bottom: 60px;
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
