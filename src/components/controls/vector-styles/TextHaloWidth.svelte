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
  const propertyName = 'text-halo-width'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let TextHaloWidthValues = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 1.0]
  $: TextHaloWidthValues, setTextHaloWidth()

  const setTextHaloWidth = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = TextHaloWidthValues[0]
    $map.setPaintProperty(layerId, propertyName, TextHaloWidthValues[0])

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Text Halo Width">
    <div class="slider">
      <RangeSlider bind:values={TextHaloWidthValues} float min={0} max={10} step={0.1} pips rest={false} />
    </div>
  </StyleControlGroup>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
