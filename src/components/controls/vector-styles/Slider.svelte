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
  export let layerType: LayerTypes
  export let propertyName: string
  export let titleName: string
  export let defaultValue: number
  export let minValue: number
  export let maxValue: number
  export let stepValue: number
  export let propertyType = 'paint'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let values = [
    style[propertyType] && style[propertyType][propertyName] ? style[propertyType][propertyName] : defaultValue,
  ]
  $: values, setValue()

  const setValue = () => {
    if (style.type !== layerType) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle[propertyType]) {
      newStyle[propertyType] = {}
    }
    newStyle[propertyType][propertyName] = values[0]
    if (propertyType === 'paint') {
      $map.setPaintProperty(layerId, propertyName, values[0])
    } else {
      $map.setLayoutProperty(layerId, propertyName, values[0])
    }

    dispatch('change')
  }
</script>

{#if style.type === layerType}
  <StyleControlGroup title={titleName}>
    <div class="slider">
      <RangeSlider
        bind:values
        float
        min={minValue}
        max={maxValue}
        step={stepValue}
        pips
        first="label"
        last="label"
        rest={false} />
    </div>
  </StyleControlGroup>
{/if}

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
