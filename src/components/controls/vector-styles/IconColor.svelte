<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const defaultColor = `rgba(0,0,0,1)`
  const layerId = layer.definition.id
  const propertyName = 'icon-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  let rgba = defaultColor

  onMount(() => {
    rgba = layer?.iconColor ? layer.iconColor : defaultColor
    $map.setPaintProperty(layerId, propertyName, rgba)
  })

  const handleSetColor = (e: CustomEvent) => {
    if (e?.detail?.color) {
      $map.setPaintProperty(layerId, propertyName, e.detail.color)
      layer.iconColor = e.detail.color
    }
  }
</script>

<MaplibreColorPicker {rgba} on:change={handleSetColor} />
