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
  const propertyName = 'text-size'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let TextSizeValues = [style.layout && style.layout[propertyName] ? style.layout[propertyName] : 16]
  $: TextSizeValues, setTextSize()

  const setTextSize = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = TextSizeValues[0]
    $map.setLayoutProperty(layerId, propertyName, TextSizeValues[0])

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Text Size">
    <div class="slider">
      <RangeSlider bind:values={TextSizeValues} float min={0} max={32} step={0.5} pips rest={false} />
    </div>
  </StyleControlGroup>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
