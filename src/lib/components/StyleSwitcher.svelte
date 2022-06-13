<script lang="ts">
  import { onMount } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { Map } from 'maplibre-gl'
  import { styles } from '$lib/constants'
  import type { StyleDefinition } from '$lib/types'
  import stylePrimaryData from '$lib/style.json'
  import styleSecondaryData from '$lib/aerialstyle.json'

  let stylePrimary: StyleDefinition = styles[0]
  let styleSecondary: StyleDefinition = styles[1]
  let activeStyle: StyleDefinition = styles[0]
  let buttonStyle: StyleDefinition = styles[1]
  const indexStyle = { id: 'index', type: 'background', layout: { visibility: 'none' } }

  export let map: Map

  let mainContainerId = 'main-switch-container'
  let mapToggle: Map

  const createMiniMap = (id: string, uri: string) => {
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
    mapToggle = createMiniMap(mainContainerId, buttonStyle.uri)
  })

  const changeStyle = () => {
    if (!map) return

    !map.getLayer('index') && map.addLayer(indexStyle, 'background')

    if (activeStyle.title === stylePrimary.title) {
      activeStyle = styleSecondary
      buttonStyle = stylePrimary
      for (const layer of stylePrimaryData.layers) {
        map.removeLayer(layer.id)
      }
      map.addSource('bing', styleSecondaryData.sources.bing)
      for (const layer of styleSecondaryData.layers) {
        map.addLayer(layer, 'index')
      }
    } else {
      activeStyle = stylePrimary
      buttonStyle = styleSecondary
      for (const layer of styleSecondaryData.layers) {
        map.removeLayer(layer.id)
      }
      map.removeSource('bing')
      for (const layer of stylePrimaryData.layers) {
        map.addLayer(layer, 'index')
      }
    }

    if (!mapToggle) {
      createMiniMap(mainContainerId, buttonStyle.uri)
    } else {
      mapToggle.setStyle(buttonStyle.uri)
    }
  }
</script>

<div class="main-switch-container">
  <Wrapper>
    <div
      class="map-button"
      id={mainContainerId}
      on:click={() => {
        changeStyle()
      }} />
    {#if buttonStyle}
      <Tooltip yPos="above">{buttonStyle.title}</Tooltip>
    {/if}
  </Wrapper>
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
</style>
