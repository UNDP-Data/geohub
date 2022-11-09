<script lang="ts">
  import { onMount } from 'svelte'
  import maplibregl, { Map } from 'maplibre-gl'
  import '@watergis/maplibre-gl-export/css/styles.css'

  import MapQueryInfoPanel from '$components/MapQueryInfoPanel.svelte'
  import AdminLayer from '$lib/adminLayer'
  import StyleSwicher from '$lib/components/StyleSwitcher.svelte'
  import CurrentLocation from '$lib/components/CurrentLocation.svelte'
  import { styles } from '$lib/constants'
  import { loadImageToDataUrl, fetchUrl, clipSprite } from '$lib/helper'
  import type { Sprite } from '$lib/types'
  import { indicatorProgress, map, spriteImageList } from '$stores'
  import { PUBLIC_AZURE_URL } from '$lib/variables/public'

  let adminLayer: AdminLayer = null
  let container: HTMLDivElement
  let isStyleSwitcherVisible = false

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

  const initAdminLayer = () => {
    isStyleSwitcherVisible = true

    if (!$map) return
    if (!adminLayer) {
      adminLayer = new AdminLayer($map, PUBLIC_AZURE_URL, false)
    }
    adminLayer.load()
    adminLayer.setInteraction()
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/maplibre-gl@2.1.1/dist/maplibre-gl.css" />
</svelte:head>

<div
  bind:this={container}
  class="map"
  id="map">
  {#if map}
    <slot />
  {/if}
</div>

<CurrentLocation bind:map={$map} />
<MapQueryInfoPanel bind:map={$map} />
{#if isStyleSwitcherVisible}
  <StyleSwicher bind:map={$map} />
{/if}

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
