<script lang="ts">
  import Slider from '$components/controls/vector-styles/Slider.svelte'
  import { LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer

  let defaultValue = 1
  let layerType = LayerTypes.HEATMAP
  let maxValue = 5
  let minValue = 0
  let propertyName = 'heatmap-intensity'
  let stepValue = 0.1
  let titleName = 'Heatmap Intensity'
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
