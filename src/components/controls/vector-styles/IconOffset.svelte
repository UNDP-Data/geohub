<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import '../../../styles/vector-style-slider.scss'

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-offset'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let iconOffsetValues = style.layout && style.layout[propertyName] ? style.layout[propertyName] : [0, 0]
  let xValues = [iconOffsetValues[0]]
  let yValues = [iconOffsetValues[1]]

  $: xValues, setIconOffset()
  $: yValues, setIconOffset()

  const setIconOffset = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    iconOffsetValues = [xValues[0], yValues[0]]
    newStyle.layout[propertyName] = iconOffsetValues
    $map.setLayoutProperty(layerId, propertyName, iconOffsetValues)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Icon Offset">
    <p>X offset</p>
    <div class="slider">
      <RangeSlider
        bind:values={xValues}
        float
        min={-10}
        max={10}
        step={0.1}
        pips
        first="label"
        last="label"
        rest={false} />
    </div>
    <p>Y offset</p>
    <div class="slider">
      <RangeSlider
        bind:values={yValues}
        float
        min={-10}
        max={10}
        step={0.1}
        pips
        first="label"
        last="label"
        rest={false} />
    </div>
  </StyleControlGroup>
{/if}

<style lang="scss">
</style>
