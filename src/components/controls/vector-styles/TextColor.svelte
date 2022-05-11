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
  const propertyName = 'text-color'
  const defaultColor = `rgba(0,0,0,1)`
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let rgba = style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultColor

  const handleSetColor = (e: CustomEvent) => {
    if (style.type !== LayerTypes.SYMBOL) return
    rgba = e.detail.color
    $map.setPaintProperty(layerId, propertyName, rgba)
    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Text Color">
    <MaplibreColorPicker {rgba} on:change={handleSetColor} />
  </StyleControlGroup>
{/if}

<style lang="scss">
  @use '@material/image-list/index' as image-list;
</style>
