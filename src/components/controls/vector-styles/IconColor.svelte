<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import { getIconColor } from '$lib/helper'

  export let layer: Layer = LayerInitialValues

  const defaultColor = `rgba(0,0,0,1)`
  const layerId = layer.definition.id
  const propertyName = 'icon-color'

  let rgba = getIconColor($map, layer.definition.id)

  onMount(() => {
    rgba = getIconColor($map, layer.definition.id)
    $map.setPaintProperty(layerId, propertyName, rgba)
  })

  const handleSetColor = (e: CustomEvent) => {
    if (e?.detail?.color) {
      $map.setPaintProperty(layerId, propertyName, e.detail.color)
      $map.fire('icon-color:changed', { value: e.detail.color })
    }
  }
</script>

<MaplibreColorPicker
  {rgba}
  on:change={handleSetColor} />
