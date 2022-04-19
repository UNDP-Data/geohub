<script lang="ts">
  import type { Layer } from '../../../lib/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  const onStyleChange = () => {
    dispatch('change')
  }

  export let layer: Layer = LayerInitialValues
  import Slider from './Slider.svelte'

  let layerType = LayerTypes.SYMBOL
  let propertyName = 'text-halo-width'
  let titleName = 'Text Halo Width'
  let defaultValue = 1
  let minValue = 0
  let maxValue = 10
  let stepValue = 0.1
  let propertyType = 'paint'
</script>

<Slider
  {layer}
  on:change={onStyleChange}
  bind:layerType
  bind:propertyName
  bind:titleName
  bind:defaultValue
  bind:minValue
  bind:maxValue
  bind:stepValue
  bind:propertyType />
