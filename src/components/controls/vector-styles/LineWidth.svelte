<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues } from '../../../lib/constants'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let LineWidthValues = [style.paint && style.paint['line-width'] ? style.paint['line-width'] : 1.0]
  $: LineWidthValues, setLineWidth()

  const setLineWidth = () => {
    if (style.type !== 'line') return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint['line-width'] = LineWidthValues[0]
    $map.setPaintProperty(layerId, 'line-width', LineWidthValues[0])

    dispatch('change', [
      {
        property: 'line-width',
        value: LineWidthValues[0],
      },
    ])
  }
</script>

{#if style.type === 'line'}
  <p>Line Width</p>
  <div class="slider">
    <RangeSlider bind:values={LineWidthValues} float min={0} max={10} step={0.1} pips rest={false} />
  </div>
{/if}

<style lang="scss">
  .slider {
    --range-handle-focus: #2196f3;
    --range-range-inactive: #2196f3;
    --range-handle-inactive: #2196f3;
    --range-handle: #2196f3;
  }
</style>
