<script lang="ts">
  import { onMount } from 'svelte'
  import maplibregl, { Map, MapMouseEvent } from 'maplibre-gl'
  import { cloneDeep } from 'lodash-es'

  import '@watergis/maplibre-gl-export/css/styles.css'
  import { indicatorProgress, map, layerList, spriteImageList } from '$stores'
  import MapQueryInfoPanel from '$components/MapQueryInfoPanel.svelte'
  import { LayerTypes } from '$lib/constants'
  import { loadImageToDataUrl, fetchUrl, clipSprite } from '$lib/helper'
  import type { Sprite } from '$lib/types'

  let container: HTMLDivElement
  let mapMouseEvent: MapMouseEvent

  onMount(async () => {
    const newMap = new Map({
      container,
      style: 'https://undp-data.github.io/style/style.json',
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

    newMap.addControl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      exportControl,
      'top-right',
    )

    newMap.on('click', async function (e: MapMouseEvent) {
      // clear all previous vector feature properties
      for (const layer of $layerList) {
        if (layer.type === LayerTypes.VECTOR) {
          const layerClone = cloneDeep(layer)
          layerClone.features = []
          const layerIndex = $layerList.findIndex((layer) => layer.definition.id === layerClone.definition.id)
          $layerList[layerIndex] = layerClone
        }
      }

      mapMouseEvent = e
    })

    const indicatorProgressEvents = {
      true: ['zoomstart', 'touchmove', 'mousedown'],
      false: ['zoomend', 'touchend', 'mouseup'],
    }

    Object.keys(indicatorProgressEvents).forEach((state) => {
      indicatorProgressEvents[state].forEach((event: string) => {
        newMap.on(event, () => {
          $indicatorProgress = state === 'true'
        })
      })
    })

    newMap.on('load', () => {
      const styleUrl = newMap.getStyle().sprite.replace('/sprite/sprite', '/sprite-non-sdf/sprite')
      const promise = Promise.all([loadImageToDataUrl(`${styleUrl}@4x.png`), fetchUrl(`${styleUrl}@4x.json`)])
      promise
        .then(([dataUrl, json]) => {
          const sprite: Sprite = {
            dataUrl: dataUrl,
            json: json,
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
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@2.1.1/dist/maplibre-gl.css" />
</svelte:head>

<div bind:this={container} class="map" id="map">
  {#if map}
    <slot />
  {/if}
</div>

<MapQueryInfoPanel bind:mapMouseEvent />

<style lang="scss">
  .map {
    height: 100%;
    width: 100%;
  }
</style>
