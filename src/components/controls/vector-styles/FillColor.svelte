<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import MaplibreColorPicker from './MaplibreColorPicker.svelte'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'fill-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  const defaultColor = `rgba(20,180,60,1)`

  let rgba = style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultColor

  const handleSetColor = (e: CustomEvent) => {
    if (style.type !== LayerTypes.FILL) return
    rgba = e.detail.color
    $map.setPaintProperty(layerId, propertyName, rgba)
    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.FILL}
  <StyleControlGroup title="Fill Color">
    <MaplibreColorPicker {rgba} on:change={handleSetColor} />
  </StyleControlGroup>
{/if}
