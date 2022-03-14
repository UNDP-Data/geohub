<script lang="ts">
  import { onMount } from 'svelte'
  import maplibregl, { Map } from 'maplibre-gl'
  import '@watergis/maplibre-gl-export/css/styles.css'
  import { map } from '../stores/mapstore'

  export let lat = 0
  export let lon = 0
  export let zoom = 3

  let container: HTMLDivElement

  onMount(async () => {
    const new_map = new Map({
      container,
      style: 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [lon, lat],
      zoom,
      hash: true,
    })

    new_map.addControl(new maplibregl.NavigationControl({}), 'top-right')
    new_map.addControl(new maplibregl.ScaleControl({}), 'bottom-left')

    const { MaplibreExportControl, Size, PageOrientation, Format, DPI } = await import('@watergis/maplibre-gl-export')

    new_map.addControl(
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

    map.update(() => new_map)
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
