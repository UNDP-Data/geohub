<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'

  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'
  import StyleControlGroup from '../../control-groups/StyleControlGroup.svelte'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'heatmap-intensity'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let values = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 1.0]
  $: values, setLineWidth()

  const setLineWidth = () => {
    if (style.type !== LayerTypes.HEATMAP) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = values[0]
    $map.setPaintProperty(layerId, propertyName, values[0])

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.HEATMAP}
  <StyleControlGroup title="Heatmap Intensity">
    <div class="slider">
      <RangeSlider bind:values float min={0} max={5} step={0.1} pips rest={false} />
    </div>
  </StyleControlGroup>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
