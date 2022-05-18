<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let choices = ['never', 'always', 'cooperative']
  let selected = [choices.findIndex((choice) => choice === 'never')]

  $: selected, setIconOverlap()

  const setIconOverlap = () => {
    $map.setLayoutProperty(layerId, 'icon-overlap', choices[selected[0]])
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <div class="range-slider" style="width: 150px;">
    <RangeSlider
      bind:values={selected}
      min={0}
      formatter={(v) => choices[v]}
      max={choices.length - 1}
      all="label"
      pips />
  </div>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';

  .range-slider {
    font-size: 11px;
    width: 100%;
  }
</style>
