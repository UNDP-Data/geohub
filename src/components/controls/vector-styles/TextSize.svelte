<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Slider from '$components/controls/vector-styles/Slider.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const onStyleChange = () => {
    dispatch('change')
  }

  let defaultValue = 16
  let layerType = LayerTypes.SYMBOL
  let maxValue = 32
  let minValue = 0
  let propertyName = 'text-size'
  let propertyType = 'layout'
  let stepValue = 0.5
  let titleName = 'Text Size'
  let styleControlGroupDisabled = true
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
  bind:propertyType
  bind:styleControlGroupDisabled />
