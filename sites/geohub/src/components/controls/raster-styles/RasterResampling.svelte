<script lang="ts">
  import ToggleOptions from './ToggleOptions.svelte'
  import type { Map } from 'maplibre-gl'
  import type { ToggleOption } from '$lib/types'

  export let map: Map
  export let layerId: string

  let options: ToggleOption[] = [
    {
      title: 'linear',
      value: 'linear',
    },
    {
      title: 'nearest',
      value: 'nearest',
    },
  ]

  const getValue = () => {
    let value = map.getPaintProperty(layerId, 'raster-resampling')

    if (!value) {
      value = options[0].value
    }
    return value as string
  }

  let value: string = getValue()

  $: value, setValue()

  const setValue = () => {
    map?.setPaintProperty(layerId, 'raster-resampling', value)
  }
</script>

<ToggleOptions
  bind:options
  bind:selectedValue={value} />
