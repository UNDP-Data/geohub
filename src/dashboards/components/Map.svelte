<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { map } from '../stores'
  import { Map, NavigationControl, GeolocateControl, ScaleControl, AttributionControl } from 'maplibre-gl'
  import CurrentLocation from './CurrentLocation.svelte'
  import StyleSwicher from './StyleSwitcher.svelte'
  import { fetchUrl } from '$lib/helper'
  import type { StyleDefinition } from '$lib/types'

  const dispatch = createEventDispatcher()

  const BingMapsKey = import.meta.env.VITE_BINGMAP_KEY
  let newMap: Map
  let mapContainer: HTMLDivElement

  let styles: StyleDefinition[] = [
    {
      title: 'Carto',
      uri: 'https://undp-data.github.io/style/style.json',
    },
    {
      title: 'Bing Aerial',
      uri: 'https://undp-data.github.io/style/aerialstyle.json',
    },
  ]

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

    map.update(() => newMap)
  })

  export function styleChanged(e) {
    dispatch('styleChanged', {
      style: e.detail.style,
    })
  }
</script>

<div class="map" id="map" bind:this={mapContainer} />
<CurrentLocation />
<StyleSwicher bind:stylePrimary={styles[0]} bind:styleSecondary={styles[1]} on:styleChanged={styleChanged} />

<style>
  @import 'maplibre-gl/dist/maplibre-gl.css';
  .map {
    height: 100%;
    width: 100%;
  }
</style>
