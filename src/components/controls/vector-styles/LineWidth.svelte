<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'

  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'line-width'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let LineWidthValues = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 1.0]
  $: LineWidthValues, setLineWidth()

  const setLineWidth = () => {
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = LineWidthValues[0]
    $map.setPaintProperty(layerId, propertyName, LineWidthValues[0])

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.LINE}
  <p>Line Width</p>
  <div class="slider">
    <RangeSlider bind:values={LineWidthValues} float min={0} max={10} step={0.1} pips rest={false} />
  </div>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
