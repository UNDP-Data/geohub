<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { Map, NavigationControl, GeolocateControl, ScaleControl, AttributionControl } from 'maplibre-gl'

  import CurrentLocation from '$lib/components/CurrentLocation.svelte'
  import StyleSwicher from '$lib/components/StyleSwitcher.svelte'
  import { styles } from '$lib/constants'
  import { map } from '../stores'

  const dispatch = createEventDispatcher()

  let mapContainer: HTMLDivElement
  let newMap: Map

  onMount(async () => {
    newMap = new Map({
      container: mapContainer,
      style: styles[0].uri,
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
    newMap.getCanvas().style.cursor = 'pointer'

    map.update(() => newMap)
  })

  export function styleChanged(e: CustomEvent) {
    dispatch('styleChanged', {
      style: e.detail.style,
    })
  }
</script>

<div class="map" id="map" bind:this={mapContainer} />
<CurrentLocation bind:map={$map} />
<StyleSwicher
  bind:stylePrimary={styles[0]}
  bind:styleSecondary={styles[1]}
  on:styleChanged={styleChanged}
  bind:map={$map} />

<style>
  @import 'maplibre-gl/dist/maplibre-gl.css';
  .map {
    height: 100%;
    width: 100%;
  }

  :global(.maplibregl-ctrl-bottom-right) {
    padding-left: 80px;
  }
</style>
