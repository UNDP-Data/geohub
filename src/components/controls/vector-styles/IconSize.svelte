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
  const propertyName = 'icon-size'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let IconSizeValues = [style.layout && style.layout[propertyName] ? style.layout[propertyName] : 1]
  $: IconSizeValues, setIconSize()

  const setIconSize = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = IconSizeValues[0]
    $map.setLayoutProperty(layerId, propertyName, IconSizeValues[0])

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Icon Size">
    <div class="slider">
      <RangeSlider bind:values={IconSizeValues} float min={0} max={5} step={0.1} pips rest={false} />
    </div>
  </StyleControlGroup>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
