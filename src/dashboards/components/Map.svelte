<script lang="ts">
  import { onMount } from 'svelte'
  import { map } from '../stores'
  import { Map, NavigationControl, GeolocateControl, ScaleControl, AttributionControl } from 'maplibre-gl'
  import BasemapsControl from 'maplibre-gl-basemaps'
  import MaplibreDrawCircleControl from '../plugins/DrawCircleControl'

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
    newMap.addControl(new MaplibreDrawCircleControl())

    const BingMapsKey = import.meta.env.VITE_BINGMAP_KEY
    newMap.addControl(
      new BasemapsControl({
        basemaps: [
          {
            id: 'basemap_World_Topo_Map',
            tiles: ['//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
          },
          {
            id: 'esri_satellite',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          },
          {
            id: 'Bing CanvasLight',
            tiles: [`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/CanvasLight?key=${BingMapsKey}`],
          },
          {
            id: 'Bing CanvasDark',
            tiles: [`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/CanvasDark?key=${BingMapsKey}`],
          },
          {
            id: 'Bing Aerial',
            tiles: [`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=${BingMapsKey}`],
          },
          {
            id: 'Bing AerialWithLabels',
            tiles: [`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/AerialWithLabels?key=${BingMapsKey}`],
          },
        ],
        initialBasemap: 'basemap_World_Topo_Map',
        expandDirection: 'top',
      }),
      'bottom-left',
    )

    map.update(() => newMap)
  })
</script>

<div class="map" id="map" bind:this={mapContainer} />

<style>
  @import 'maplibre-gl/dist/maplibre-gl.css';
  @import 'maplibre-gl-basemaps/lib/basemaps.css';
  @import '../css/DrawCircleControl.css';
  .map {
    height: 100%;
    width: 100%;
  }
</style>
