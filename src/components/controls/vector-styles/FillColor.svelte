<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { DEFAULT_LINE_COLOR, LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'fill-color'

  let rgba = DEFAULT_LINE_COLOR

  onMount(() => {
    rgba = layer.fillColor ? layer.fillColor : DEFAULT_LINE_COLOR
    $map.setPaintProperty(layerId, propertyName, rgba)
    layer.fillColor = rgba
  })

  const handleSetColor = (e: CustomEvent) => {
    rgba = e.detail.color
    $map.setPaintProperty(layerId, propertyName, rgba)
  }
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
