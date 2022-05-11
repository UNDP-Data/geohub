<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Slider from '$components/controls/vector-styles/Slider.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'

  const dispatch = createEventDispatcher()
  const onStyleChange = () => {
    dispatch('change')
  }

  export let layer: Layer = LayerInitialValues

  let defaultValue = 100
  let layerType = LayerTypes.HEATMAP
  let maxValue = 10
  let minValue = 0
  let propertyName = 'heatmap-weight'
  let stepValue = 0.1
  let titleName = 'Heatmap Weight'
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
