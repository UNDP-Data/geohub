<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import MaplibreColorPicker from './MaplibreColorPicker.svelte'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'text-halo-color'
  const defaultColor = `rgba(255,255,255,1)`
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let rgba = style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultColor

  const setColor = (e) => {
    if (style.type !== LayerTypes.SYMBOL) return
    rgba = e.detail.color
    $map.setPaintProperty(layerId, propertyName, rgba)
    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Text Halo Color">
    <MaplibreColorPicker {rgba} on:change={setColor} />
  </StyleControlGroup>
{/if}

<style lang="scss">
  @use '@material/image-list/index' as image-list;
</style>
