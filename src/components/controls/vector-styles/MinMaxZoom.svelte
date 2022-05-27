<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import RangeSlider from 'svelte-range-slider-pips'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let ZoomSliderValues = [style.minzoom ? style.minzoom : 0, style.maxzoom ? style.maxzoom : 24]

  $: ZoomSliderValues, setMinMaxZoom()

  const setMinMaxZoom = () => {
    const newStyle: LayerSpecification = JSON.parse(JSON.stringify(style))
    newStyle.minzoom = ZoomSliderValues[0]
    newStyle.maxzoom = ZoomSliderValues[1]
    $map.setLayerZoomRange(layerId, newStyle.minzoom, newStyle.maxzoom)
    dispatch('change')
  }
</script>

<StyleControlGroup title="Min/Max Zoom Level">
  <div class="range-slider">
    <RangeSlider
      bind:values={ZoomSliderValues}
      float
      range
      min={0}
      max={24}
      step={1}
      pips
      first="label"
      last="label"
      rest={false} />
  </div>
</StyleControlGroup>

<style lang="scss">
  @import '../../../styles/vector-style-slider.scss';
</style>
