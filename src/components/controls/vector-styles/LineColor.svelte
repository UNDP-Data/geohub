<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { DEFAULT_LINE_COLOR, LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const defaultColor = DEFAULT_LINE_COLOR
  const layerId = layer.definition.id
  const propertyName = 'line-color'

  let rgba = defaultColor

  onMount(() => {
    rgba = layer.iconColor ? layer.iconColor : defaultColor
    $map.setPaintProperty(layerId, propertyName, rgba)
  })

  const handleSetColor = (e: CustomEvent) => {
    if (e?.detail?.color) {
      $map.setPaintProperty(layerId, propertyName, e.detail.color)
      layer.iconColor = e.detail.color
    }
  }
</script>

<MaplibreColorPicker
  {rgba}
  on:change={handleSetColor} />
