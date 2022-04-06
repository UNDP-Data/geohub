<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'

  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'
  import StyleControlGroup from '../../control-groups/StyleControlGroup.svelte'

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'line-blur'
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

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.LINE}
  <StyleControlGroup title="Line Blurr">
    <div class="slider">
      <RangeSlider bind:values={LineBlurValues} float min={0} max={10} step={0.1} pips rest={false} />
    </div>
  </StyleControlGroup>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
