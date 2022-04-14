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
  const propertyName = 'text-max-width'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let TextMaxWidthValues = [style.layout && style.layout[propertyName] ? style.layout[propertyName] : 10]
  $: TextMaxWidthValues, setTextMaxWidth()

  const setTextMaxWidth = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = TextMaxWidthValues[0]
    $map.setLayoutProperty(layerId, propertyName, TextMaxWidthValues[0])

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Text Max Width">
    <div class="slider">
      <RangeSlider bind:values={TextMaxWidthValues} float min={0} max={20} step={1} pips rest={false} />
    </div>
  </StyleControlGroup>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
