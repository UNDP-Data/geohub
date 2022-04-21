<script lang="ts">
  import { onMount } from 'svelte'
  import { map } from '../stores'
  import { Map, NavigationControl, GeolocateControl, ScaleControl, AttributionControl } from 'maplibre-gl'

  let newMap: Map
  let mapContainer: HTMLDivElement
  onMount(async () => {
    newMap = new Map({
      container: mapContainer,
      style: 'https://undp-data.github.io/style/style.json',
      center: [0, 0],
      zoom: 3,
      hash: true,
      attributionControl: false,
    })
    newMap.addControl(new NavigationControl({}), 'top-right')
    newMap.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right',
    )
    newMap.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left')
    newMap.addControl(new AttributionControl({ compact: true }), 'bottom-right')

    map.update(() => newMap)
  })
</script>

<div class="map" id="map" bind:this={mapContainer} />

<style>
  @import 'maplibre-gl/dist/maplibre-gl.css';
  .map {
    height: 100%;
    width: 100%;
  }
</style>
