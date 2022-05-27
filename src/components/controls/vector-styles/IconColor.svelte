<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import MaplibreColorPicker from './MaplibreColorPicker.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  const defaultColor = `rgba(0,0,0,1)`

  let rgba = style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultColor

  const handleSetColor = (e: CustomEvent) => {
    if (e?.detail?.color) {
      $map.setPaintProperty(layerId, propertyName, e.detail.color)
    }
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <MaplibreColorPicker {rgba} on:change={handleSetColor} />
{/if}
