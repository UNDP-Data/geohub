<script lang="ts">
  import { onMount } from 'svelte'
  import { map } from '../stores'
  import { Map, NavigationControl, GeolocateControl, ScaleControl, AttributionControl } from 'maplibre-gl'
  import BasemapsControl from 'maplibre-gl-basemaps'
  import { fetchUrl } from '$lib/helper'

  const BingMapsKey = import.meta.env.VITE_BINGMAP_KEY
  let newMap: Map
  let mapContainer: HTMLDivElement

  const getQuadkey = (z: number, x: number, y: number): string => {
    let quadkey = '',
      mask
    for (let i = z; i > 0; i--) {
      mask = 1 << (i - 1)
      quadkey += (x & mask ? 1 : 0) + (y & mask ? 2 : 0)
    }
    return quadkey
  }

  let aerialBingTiles = []

  onMount(async () => {
    const bingAerialLayerMeta = await fetchUrl(
      `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=${BingMapsKey}`,
    )

    const { estimatedTotal, resources } = bingAerialLayerMeta.resourceSets[0]

    // should probably warn user if estimatedTotal == 0
    //const aerialBingUrl = resources[0].imageUrl
    const aerialBingUrl = 'http://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1'
    const signedAerialBingUrl = `${aerialBingUrl}?key=${BingMapsKey}`
    const imageUrlSubdomains = resources[0].imageUrlSubdomains
    aerialBingTiles = imageUrlSubdomains.map((el) => {
      return aerialBingUrl.replace('{subdomain}', el)
    })
    console.log(aerialBingUrl.replace('{quadkey}', getQuadkey(1, 0, 0)))
    console.log(aerialBingTiles)

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

    // newMap.addControl(
    //   new BasemapsControl({
    //     basemaps: [
    //       {
    //         id: 'basemap_World_Topo_Map',
    //         tiles: ['//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
    //       },
    //       {
    //         id: 'esri_satellite',
    //         tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    //       },
    //       // {
    //       //   id: 'Bing CanvasLight',
    //       //   tiles: [`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/CanvasLight?key=${BingMapsKey}`],
    //       // },
    //       // {
    //       //   id: 'Bing CanvasDark',
    //       //   tiles: [`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/CanvasDark?key=${BingMapsKey}`],
    //       // },

    //       {
    //         id: 'Bing Aerial',
    //         tiles: ['http://ecn.t3.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1'],
    //       },
    //     ],
    //     initialBasemap: 'basemap_World_Topo_Map',
    //     expandDirection: 'top',
    //   }),
    //   'bottom-left',
    // )

    map.update(() => newMap)
  })
</script>

<div class="map" id="map" bind:this={mapContainer} />

<style>
  @import 'maplibre-gl/dist/maplibre-gl.css';
  @import 'maplibre-gl-basemaps/lib/basemaps.css';
  .map {
    height: 100%;
    width: 100%;
  }
</style>
