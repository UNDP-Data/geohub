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

  let LineBlurValues = [style.paint && style.paint['line-blur'] ? style.paint['line-blur'] : 0]
  $: LineBlurValues, setLineBlur()

  const setLineBlur = () => {
    if (style.type !== 'line') return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint['line-blur'] = LineBlurValues[0]
    $map.setPaintProperty(layerId, 'line-blur', LineBlurValues[0])

    dispatch('change', [
      {
        property: 'line-blur',
        value: LineBlurValues[0],
      },
    ])
  }
</script>

{#if style.type === 'line'}
  <p>Line Blur</p>
  <div class="slider">
    <RangeSlider bind:values={LineBlurValues} float min={0} max={10} step={0.1} pips rest={false} />
  </div>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
