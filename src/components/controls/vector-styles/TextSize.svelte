<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import NumberInput from '../NumberInput.svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  export let layer: Layer = LayerInitialValues
  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  const dispatch = createEventDispatcher()

  let propertyName = 'text-size'
  let value = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 16
  let layerType = LayerTypes.SYMBOL
  let maxValue = 32
  let minValue = 0
  let stepValue = 0.5

  $: value, setValue()

  const setValue = () => {
    if (style.type !== layerType) return
    $map.setLayoutProperty(layerId, propertyName, value)
    dispatch('change')
  }
</script>

<div style="display: flex; justify-content: space-between ; align-items: center; margin-top: 10px">
  <span style="margin-right: 5px">Text Size</span>
  <NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
</div>
