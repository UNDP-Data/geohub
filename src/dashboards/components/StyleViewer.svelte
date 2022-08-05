<script lang="ts">
  import { onMount } from 'svelte'
  import { Map, NavigationControl, GeolocateControl, ScaleControl, AttributionControl } from 'maplibre-gl'
  import { page } from '$app/stores'
  import { map } from '../stores'
  import { MaplibreLegendControl } from '@watergis/maplibre-gl-legend'
  import AdminLayer from '$lib/adminLayer'
  import CurrentLocation from '$lib/components/CurrentLocation.svelte'
  import MapQueryInfoControl from './MapQueryInfoControl.svelte'

  const AZURE_URL = import.meta.env.VITE_ADMIN_URL
  let mapContainer: HTMLDivElement
  let adminLayer: AdminLayer = null
  let isMapLoaded = false

  onMount(async () => {
    const tmpMap = new Map({
      container: mapContainer,
      style: `https://undp-data.github.io/style/style.json`,
      center: [0, 0],
      zoom: 4,
      hash: false,
      attributionControl: false,
    })
    map.update(() => tmpMap)

    tmpMap.on('load', async () => {
      await addControls()
      await loadStyle()
    })
  })

  const addControls = async () => {
    $map.addControl(new NavigationControl({}), 'top-right')
    $map.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right',
    )
    $map.addControl(new ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left')
    $map.addControl(new AttributionControl({ compact: true }), 'bottom-right')

    const { MaplibreExportControl } = await import('@watergis/maplibre-gl-export')
    $map.addControl(
      new MaplibreExportControl({
        Crosshair: true,
        PrintableArea: true,
      }),
      'top-right',
    )

    $map.addControl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new MaplibreLegendControl(
        {},
        {
          showDefault: false,
          showCheckbox: true,
          reverseOrder: true,
          onlyRendered: true,
        },
      ),
      'bottom-left',
    )
  }

  const loadStyle = async () => {
    const url = $page.url.searchParams.get('style')
    if (url) {
      const res = await fetch(url)
      const styleJSON = await res.json()
      $map.remove()

      const tmpMap = new Map({
        container: mapContainer,
        style: styleJSON,
        center: $map.getCenter(),
        zoom: $map.getZoom(),
        bearing: $map.getBearing(),
        pitch: $map.getPitch(),
        hash: true,
        attributionControl: false,
      })
      if (styleJSON.zoom) tmpMap.setZoom(styleJSON.zoom)
      if (styleJSON.bearing) tmpMap.setBearing(styleJSON.bearing)
      if (styleJSON.pitch) tmpMap.setPitch(styleJSON.pitch)
      if (styleJSON.center) tmpMap.setCenter(styleJSON.center)

      map.update(() => tmpMap)
      tmpMap.on('load', async () => {
        await addControls()
        initAdminLayer()
        isMapLoaded = true
      })
    }
  }

  const initAdminLayer = () => {
    if (!$map) return
    if (!adminLayer) {
      adminLayer = new AdminLayer($map, AZURE_URL, false)
    }
    adminLayer.load()
    adminLayer.setInteraction()
  }
</script>

<div class="map" id="map" bind:this={mapContainer} />
<CurrentLocation bind:map={$map} />
{#if isMapLoaded}
  <MapQueryInfoControl bind:map={$map} />
{/if}

<style>
  @import 'maplibre-gl/dist/maplibre-gl.css';
  @import '@watergis/maplibre-gl-export/css/styles.css';
  @import '@watergis/maplibre-gl-legend/css/styles.css';

  .map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 1;
  }
</style>
