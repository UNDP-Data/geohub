<script lang="ts">
  import { onMount } from 'svelte'
  import { Map, type StyleSpecification } from 'maplibre-gl'
  import { styles } from '$lib/constants'
  import type { StyleDefinition } from '$lib/types'
  import { fetchUrl } from '$lib/helper'

  let stylePrimary: StyleDefinition = styles[0]
  let styleSecondary: StyleDefinition = styles[1]
  let activeStyle: StyleDefinition = styles[0]
  let buttonStyle: StyleDefinition = styles[1]

  let stylePrimaryData: StyleSpecification
  let styleSecondaryData: StyleSpecification

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

  onMount(async () => {
    stylePrimaryData = await fetchUrl(stylePrimary.uri)
    styleSecondaryData = await fetchUrl(styleSecondary.uri)
    mapToggle = createMiniMap(mainContainerId, buttonStyle.uri)
  })

  const changeStyle = () => {
    if (!map) return

    if (map.getLayer(indexStyle.id)) map.removeLayer(indexStyle.id)
    const firstLayerId = map.getStyle().layers[0].id
    map.addLayer(indexStyle, firstLayerId)

    if (activeStyle.title === stylePrimary.title) {
      activeStyle = styleSecondary
      buttonStyle = stylePrimary
      for (const layer of stylePrimaryData.layers) {
        if (map.getLayer(layer.id)) map.removeLayer(layer.id)
      }
      map.addSource('bing', styleSecondaryData.sources.bing)
      for (const layer of styleSecondaryData.layers) {
        map.addLayer(layer, 'index')
      }
    } else {
      activeStyle = stylePrimary
      buttonStyle = styleSecondary
      for (const layer of styleSecondaryData.layers) {
        if (map.getLayer(layer.id)) map.removeLayer(layer.id)
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

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      changeStyle()
    }
  }
</script>

<div class="main-switch-container">
  <div
    class="map-button"
    data-tooltip={buttonStyle.title}
    id={mainContainerId}
    on:click={() => {
      changeStyle()
    }}
    on:keydown={handleEnterKey} />
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
    -moz-border-radius: 30px;
    -webkit-border-radius: 30px;
    margin: 0px;
    border-style: solid;
    border-color: #1c1c1c;
    border-width: 1px;
    background: white;
  }

  #main-switch-container {
    :global(.maplibregl-canvas) {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      -moz-border-radius: 30px;
      -webkit-border-radius: 30px;
    }
  }
</style>
