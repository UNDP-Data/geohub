<script lang="ts">
  import maplibregl, {
    AttributionControl,
    GeolocateControl,
    Map,
    NavigationControl,
    ScaleControl,
    TerrainControl,
    type TerrainSpecification,
  } from 'maplibre-gl'
  import * as pmtiles from 'pmtiles'
  import '@watergis/maplibre-gl-export/css/styles.css'

  import MapQueryInfoControl from '$components/MapQueryInfoControl.svelte'
  import StyleSwicher from '@undp-data/style-switcher'
  import CurrentLocation from '@undp-data/current-location'
  import { MAP_ATTRIBUTION, styles } from '$lib/constants'
  import { loadImageToDataUrl, fetchUrl, clipSprite } from '$lib/helper'
  import type { Sprite } from '$lib/types'
  import { spriteImageList } from '$stores'
  import { PUBLIC_AZURE_URL } from '$lib/variables/public'
  import LayerVisibilitySwitcher from './LayerVisibilitySwitcher.svelte'

  let container: HTMLDivElement
  export let map: Map

  let protocol = new pmtiles.Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)

  const terrainOptions: TerrainSpecification = {
    source: 'terrarium',
    exaggeration: 1,
  }

  const initialise = () => {
    return new Promise<void>((resolve) => {
      map = new Map({
        container,
        style: styles[0].uri,
        center: [0, 0],
        zoom: 3,
        hash: true,
        attributionControl: false,
      })

      map.addControl(new AttributionControl({ compact: true, customAttribution: MAP_ATTRIBUTION }), 'bottom-right')
      map.addControl(
        new NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true,
        }),
        'bottom-right',
      )
      map.addControl(
        new GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        'bottom-right',
      )
      map.setMaxPitch(85)
      map.addControl(new TerrainControl(terrainOptions), 'bottom-right')

      map.on('styledata', () => {
        const isTerrain = map.getTerrain()
        if (isTerrain) {
          map.setTerrain(null)
        }
        if (isTerrain) {
          setTimeout(() => {
            map.setTerrain(terrainOptions)
          }, 500)
        }
      })

      map.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left')

      map.on('load', async () => {
        map.resize()

        const { MaplibreExportControl, Size, PageOrientation, Format, DPI } = await import(
          '@watergis/maplibre-gl-export'
        )
        const exportControl = new MaplibreExportControl({
          PageSize: Size.A4,
          PageOrientation: PageOrientation.Landscape,
          Format: Format.PNG,
          DPI: DPI[96],
          Crosshair: true,
          PrintableArea: true,
        })
        map.addControl(exportControl, 'top-right')

        const styleUrl = map.getStyle().sprite.replace('/sprite/sprite', '/sprite-non-sdf/sprite')
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
            resolve()
          })
      })
    })
  }

  $: if (container) {
    initialise()
  }
</script>

<div
  bind:this={container}
  class="map" />
{#if map}
  <CurrentLocation
    bind:map
    azureBaseUrl={PUBLIC_AZURE_URL}
    isHover={false}
    position="top-left" />
  <MapQueryInfoControl bind:map />
  <StyleSwicher
    bind:map
    {styles}
    position="bottom-left" />
  <LayerVisibilitySwitcher
    bind:map
    position="top-right" />
{/if}

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
