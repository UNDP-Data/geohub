<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { DEFAULT_FILL_COLOR, LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'fill-outline-color'

  let rgba = DEFAULT_FILL_COLOR

  onMount(() => {
    rgba = layer.fillOutlineColor ? layer.fillOutlineColor : DEFAULT_FILL_COLOR
    $map.setPaintProperty(layerId, propertyName, rgba)
    layer.fillOutlineColor = rgba
  })

  const handleSetColor = (e: CustomEvent) => {
    rgba = e.detail.color
    $map.setPaintProperty(layerId, propertyName, rgba)
  }
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
