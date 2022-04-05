<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues
  const propertyName = 'line-blur'

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let LineBlurValues = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 0]
  $: LineBlurValues, setLineBlur()

  const setLineBlur = () => {
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = LineBlurValues[0]
    $map.setPaintProperty(layerId, propertyName, LineBlurValues[0])

    dispatch('change', [
      {
        property: propertyName,
        value: LineBlurValues[0],
      },
    ])
  }
</script>

{#if style.type === LayerTypes.LINE}
  <p>Line Blur</p>
  <div class="slider">
    <RangeSlider bind:values={LineBlurValues} float min={0} max={10} step={0.1} pips rest={false} />
  </div>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
