<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Slider from '$components/controls/vector-styles/Slider.svelte'

  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'

  const dispatch = createEventDispatcher()
  const onStyleChange = () => {
    dispatch('change')
  }

  export let layer: Layer = LayerInitialValues

  let defaultValue = 30
  let layerType = LayerTypes.HEATMAP
  let maxValue = 100
  let minValue = 1
  let propertyName = 'heatmap-radius'
  let stepValue = 1
  let titleName = 'Heatmap Radius'
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
