<script lang="ts">
  import { onMount } from 'svelte'
  import { cloneDeep } from 'lodash-es'
  import maplibregl, { Map, MapMouseEvent } from 'maplibre-gl'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import '@watergis/maplibre-gl-export/css/styles.css'

  import MapQueryInfoPanel from '$components/MapQueryInfoPanel.svelte'
  import AdminLayer from '$lib/adminLayer'
  import StyleSwicher from '$lib/components/StyleSwitcher.svelte'
  import CurrentLocation from '$lib/components/CurrentLocation.svelte'
  import { LayerTypes, styles } from '$lib/constants'
  import { loadImageToDataUrl, fetchUrl, clipSprite } from '$lib/helper'
  import type { Layer, Sprite } from '$lib/types'
  import { indicatorProgress, map, layerList, spriteImageList } from '$stores'

  const AZURE_URL = import.meta.env.VITE_AZURE_URL

  let adminLayer: AdminLayer = null
  let container: HTMLDivElement
  let isStyleSwitcherVisible = false
  let mapMouseEvent: MapMouseEvent

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
      initAdminLayer()
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

  const initAdminLayer = () => {
    isStyleSwitcherVisible = true

    if (!$map) return
    if (!adminLayer) {
      adminLayer = new AdminLayer($map, AZURE_URL, false)
    }
    adminLayer.load()
    adminLayer.setInteraction()
  }

  const beforeStyleChanged = () => {
    const latestStyle = $map.getStyle()
    $layerList.forEach((layer: Layer) => {
      if (latestStyle.sources[layer.definition.source]) {
        layer.source = JSON.parse(JSON.stringify(latestStyle.sources[layer.definition.source]))
      }
      if ($map.getLayer(layer.definition.id)) {
        layer.definition = JSON.parse(
          JSON.stringify(latestStyle.layers.filter((l: LayerSpecification) => l.id === layer.definition.id)[0]),
        )

        layer.children?.forEach((child) => {
          if ($map.getLayer(child.definition.id)) {
            child.definition = JSON.parse(
              JSON.stringify(latestStyle.layers.filter((l: LayerSpecification) => l.id === child.definition.id)[0]),
            )
          }
        })
      }
    })
  }

  const styleChanged = () => {
    $layerList.forEach((layer: Layer) => {
      if (!$map.getSource(layer.definition.source)) {
        $map.addSource(layer.definition.source, layer.source)
      }
      if (!$map.getLayer(layer.definition.id)) {
        if (layer.source.type === LayerTypes.RASTER) {
          let firstSymbolId = undefined
          for (const l of $map.getStyle().layers) {
            if (l.type === 'symbol') {
              firstSymbolId = l.id
              break
            }
          }
          $map.addLayer(layer.definition, firstSymbolId)
        } else {
          $map.addLayer(layer.definition)
        }
        layer.children?.forEach((child: Layer) => {
          $map.addLayer(child.definition)
        })
      }
    })
    initAdminLayer()
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@2.1.1/dist/maplibre-gl.css" />
</svelte:head>

<div bind:this={container} class="map" id="map">
  {#if map}
    <slot />
  {/if}
</div>
<CurrentLocation bind:map={$map} />

{#if isStyleSwitcherVisible}
  <StyleSwicher
    bind:stylePrimary={styles[0]}
    bind:styleSecondary={styles[1]}
    on:styleChanged={styleChanged}
    on:beforestyleChanged={beforeStyleChanged}
    bind:map={$map} />
{/if}

<MapQueryInfoPanel bind:mapMouseEvent />

<style lang="scss">
  .map {
    height: 100%;
    width: 100%;
  }
</style>
