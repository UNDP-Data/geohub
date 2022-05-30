<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const choices = ['never', 'always', 'cooperative']
  const layerId = layer.definition.id
  const propertyName = 'icon-overlap'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let selected = [choices.findIndex((choice) => choice === $map.getLayoutProperty(layerId, propertyName))]

  $: selected, setIconOverlap()

  const setIconOverlap = () => {
    $map.setLayoutProperty(layerId, propertyName, choices[selected[0]])
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <div class="range-slider" style="width: 150px;">
    <RangeSlider
      bind:values={selected}
      min={0}
      formatter={(v) => choices[v].toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase())}
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
