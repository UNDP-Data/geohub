<script lang="ts">
  import { onMount } from 'svelte'
  import maplibregl, { Map } from 'maplibre-gl'

  import '@watergis/maplibre-gl-export/css/styles.css'
  import { indicatorProgress, map } from '../stores'

  export let lat = 0
  export let lon = 0
  export let zoom = 3

  let container: HTMLDivElement

  onMount(async () => {
    const newMap = new Map({
      container,
      style: 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [lon, lat],
      zoom,
      hash: true,
    })

    newMap.addControl(new maplibregl.NavigationControl({}), 'top-right')
    newMap.addControl(new maplibregl.ScaleControl({}), 'bottom-left')

    const { MaplibreExportControl, Size, PageOrientation, Format, DPI } = await import('@watergis/maplibre-gl-export')

    newMap.addControl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new MaplibreExportControl({
        PageSize: Size.A4,
        PageOrientation: PageOrientation.Landscape,
        Format: Format.PNG,
        DPI: DPI[96],
        Crosshair: true,
        PrintableArea: true,
      }),
      'top-right',
    )

    const indicatorProgressEvents = {
      true: ['zoomstart', 'touchmove', 'mousedown'],
      false: ['zoomend', 'touchend', 'mouseup'],
    }

    Object.keys(indicatorProgressEvents).forEach((state) => {
      indicatorProgressEvents[state].forEach((event: any) => {
        newMap.on(event, () => {
          $indicatorProgress = state === 'true'
        })
      })
    })

    map.update(() => newMap)
  })
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@2.1.1/dist/maplibre-gl.css" />
</svelte:head>

<div bind:this={container}>
  {#if map}
    <slot />
  {/if}
</div>

<style lang="scss">
  :global(.maplibregl-map) {
    height: 100%;
    width: 100%;
  }
</style>
