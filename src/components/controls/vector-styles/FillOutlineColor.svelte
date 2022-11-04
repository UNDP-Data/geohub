<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import { getFillOutlineColor } from '$lib/helper'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'fill-outline-color'

  let rgba = getFillOutlineColor($map, layerId)

  onMount(() => {
    rgba = getFillOutlineColor($map, layerId)
    $map.setPaintProperty(layerId, propertyName, rgba)
  })

  const handleSetColor = (e: CustomEvent) => {
    rgba = e.detail.color
    $map.setPaintProperty(layerId, propertyName, rgba)
  }
</script>

<MaplibreColorPicker
  {rgba}
  on:change={handleSetColor} />
