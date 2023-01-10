<script lang="ts">
  import Slider from '$components/controls/vector-styles/Slider.svelte'
  import { LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer

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
  styleControlGroupDisabled={true}
  bind:layerType
  bind:propertyName
  bind:titleName
  bind:defaultValue
  bind:minValue
  bind:maxValue
  bind:stepValue />
