<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'

  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import { LayerInitialValues } from '../../../lib/constants'
  import StyleControlGroup from '../../control-groups/StyleControlGroup.svelte'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let ZoomSliderValues = [0, 24]
  $: ZoomSliderValues, setMinMaxZoom()

  const setMinMaxZoom = () => {
    const newStyle = JSON.parse(JSON.stringify(style))
    newStyle.minzoom = ZoomSliderValues[0]
    newStyle.maxzoom = ZoomSliderValues[1]
    $map.setLayerZoomRange(layerId, newStyle.minzoom, newStyle.maxzoom)
    dispatch('change')
  }
</script>

<StyleControlGroup title="Line Width">
  <div class="slider">
    <RangeSlider
      bind:values={ZoomSliderValues}
      float
      range
      min={0}
      max={24}
      step={1}
      pips
      first="1"
      last="20"
      rest={false} />
  </div>
</StyleControlGroup>

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
