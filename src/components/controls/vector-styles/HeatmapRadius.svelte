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
  let propertyName = 'heatmap-radius'
  let titleName = 'Heatmap Radius'
  let defaultValue = 30
  let minValue = 1
  let maxValue = 100
  let stepValue = 1
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
