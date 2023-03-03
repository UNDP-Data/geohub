<script lang="ts">
  import Slider from './Slider.svelte'
  import type { Map } from 'maplibre-gl'

  export let map: Map
  export let layerId: string

  const getValue = () => {
    let value = map.getPaintProperty(layerId, 'raster-contrast')

    if (!value) {
      value = 0
    }
    return value as number
  }

  let value = getValue()

  $: value, setValue()

  const setValue = () => {
    map?.setPaintProperty(layerId, 'raster-contrast', value)
  }
</script>

<Slider
  bind:value
  min={-1}
  max={1}
  step={0.1}
  unit="" />
