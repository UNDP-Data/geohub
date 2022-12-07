<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from 'maplibre-gl'

  import NumberInput from '$components/controls/NumberInput.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues
  const layerId = layer.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  const dispatch = createEventDispatcher()

  let propertyName = 'text-halo-width'
  let value = style.paint && style.paint[propertyName] ? style.paint[propertyName] : 1
  let layerType = LayerTypes.SYMBOL
  let maxValue = 10
  let minValue = 0
  let stepValue = 0.1

  $: value, setValue()

  const setValue = () => {
    if (style.type !== layerType) return
    $map.setPaintProperty(layerId, propertyName, value)
    dispatch('change')
  }
</script>

<NumberInput
  bind:value
  bind:minValue
  bind:maxValue
  bind:step={stepValue}
  on:change={setValue} />
