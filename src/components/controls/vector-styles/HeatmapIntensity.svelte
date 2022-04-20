<script lang="ts">
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  const onStyleChange = () => {
    dispatch('change')
  }

  export let layer: Layer = LayerInitialValues
  import Slider from '$components/controls/vector-styles/Slider.svelte'

  let layerType = LayerTypes.HEATMAP
  let propertyName = 'heatmap-intensity'
  let titleName = 'Heatmap Intensity'
  let defaultValue = 1
  let minValue = 0
  let maxValue = 5
  let stepValue = 0.1
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
  bind:stepValue />
