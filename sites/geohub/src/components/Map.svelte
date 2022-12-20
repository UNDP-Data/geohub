<script lang="ts">
  import { onMount } from 'svelte'
  import maplibregl, { Map } from 'maplibre-gl'
  import '@watergis/maplibre-gl-export/css/styles.css'

  import MapQueryInfoPanel from '$components/MapQueryInfoPanel.svelte'
  import StyleSwicher from '@undp-data/style-switcher'
  import CurrentLocation from '@undp-data/current-location'
  import { styles } from '$lib/constants'
  import { loadImageToDataUrl, fetchUrl, clipSprite } from '$lib/helper'
  import type { Sprite } from '$lib/types'
  import { map, spriteImageList } from '$stores'
  import { PUBLIC_AZURE_URL } from '$lib/variables/public'

  let container: HTMLDivElement

  onMount(async () => {
    const newMap = new Map({
      container,
      style: styles[0].uri,
      center: [0, 0],
      zoom: 3,
      hash: true,
    })

    newMap.addControl(new maplibregl.NavigationControl({}), 'top-right')
    newMap.addControl(new maplibregl.ScaleControl({}), 'bottom-left')

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

    newMap.on('load', () => {
      // initAdminLayer()
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

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/maplibre-gl@2.1.1/dist/maplibre-gl.css" />
</svelte:head>

<div
  bind:this={container}
  class="map" />

<CurrentLocation
  bind:map={$map}
  azureBaseUrl={PUBLIC_AZURE_URL}
  isHover={false}
  position="top-left" />
<MapQueryInfoPanel bind:map={$map} />
<StyleSwicher
  bind:map={$map}
  {styles}
  position="bottom-left" />

<style lang="scss">
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
