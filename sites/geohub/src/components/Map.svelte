<script lang="ts">
  import { onMount } from 'svelte'
  import maplibregl, { AttributionControl, GeolocateControl, Map, NavigationControl, ScaleControl } from 'maplibre-gl'
  import * as pmtiles from 'pmtiles'
  import '@watergis/maplibre-gl-export/css/styles.css'

  import MapQueryInfoControl from '$components/MapQueryInfoControl.svelte'
  import StyleSwicher from '@undp-data/style-switcher'
  import CurrentLocation from '@undp-data/current-location'
  import { MAP_ATTRIBUTION, styles } from '$lib/constants'
  import { loadImageToDataUrl, fetchUrl, clipSprite } from '$lib/helper'
  import type { Sprite } from '$lib/types'
  import { map, spriteImageList } from '$stores'
  import { PUBLIC_AZURE_URL } from '$lib/variables/public'

  let container: HTMLDivElement

  let protocol = new pmtiles.Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)

  onMount(async () => {
    const newMap = new Map({
      container,
      style: styles[0].uri,
      center: [0, 0],
      zoom: 3,
      hash: true,
      attributionControl: false,
    })

    newMap.addControl(new AttributionControl({ compact: true, customAttribution: MAP_ATTRIBUTION }), 'bottom-right')
    newMap.addControl(
      new NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      'bottom-right',
    )
    newMap.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'bottom-right',
    )
    newMap.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left')

    newMap.on('load', async () => {
      newMap.resize()

      const { MaplibreExportControl, Size, PageOrientation, Format, DPI } = await import('@watergis/maplibre-gl-export')
      const exportControl = new MaplibreExportControl({
        PageSize: Size.A4,
        PageOrientation: PageOrientation.Landscape,
        Format: Format.PNG,
        DPI: DPI[96],
        Crosshair: true,
        PrintableArea: true,
      })
      newMap.addControl(exportControl, 'top-right')

      const styleUrl = newMap.getStyle().sprite.replace('/sprite/sprite', '/sprite-non-sdf/sprite')
      const promise = Promise.all([loadImageToDataUrl(`${styleUrl}@4x.png`), fetchUrl(`${styleUrl}@4x.json`)])
      promise
        .then(([dataUrl, json]) => {
          const sprite: Sprite = {
            dataUrl,
            json,
          }
          return sprite
        })
        .then((sprite: Sprite) => {
          const promises = []
          Object.keys(sprite.json).forEach((id) => {
            promises.push(clipSprite(sprite.dataUrl, id, sprite.json[id]))
          })
          return Promise.all(promises)
        })
        .then((iconList) => {
          spriteImageList.update(() => iconList)
        })
    })
    map.update(() => newMap)
  })
</script>

<div
  bind:this={container}
  class="map" />

<CurrentLocation
  bind:map={$map}
  azureBaseUrl={PUBLIC_AZURE_URL}
  isHover={false}
  position="top-left" />
<MapQueryInfoControl bind:map={$map} />
<StyleSwicher
  bind:map={$map}
  {styles}
  position="bottom-left" />

<style lang="scss">
  @import 'maplibre-gl/dist/maplibre-gl.css';

  .map {
    height: calc(100vh - 93.44px);
    width: 100%;
  }
  @media (max-width: 89.9375em) {
    .map {
      height: calc(100vh - 60.94px);
    }
  }
</style>
