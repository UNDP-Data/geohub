<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'

  import { LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import { getLayerStyle } from '$lib/helper'

  export let layer: Layer

  const getLayerOpacity = (target: Layer) => {
    const id = target.id
    const style = getLayerStyle($map, target.id)
    let opacity: number
    switch (style.type) {
      case LayerTypes.RASTER:
        opacity = $map.getPaintProperty(id, 'raster-opacity') as number
        break
      case LayerTypes.SYMBOL:
        opacity = $map.getPaintProperty(id, 'icon-opacity') as number
        break
      case LayerTypes.LINE:
        opacity = $map.getPaintProperty(id, 'line-opacity') as number
        break
      case LayerTypes.FILL:
        opacity = $map.getPaintProperty(id, 'fill-opacity') as number
        break
      case LayerTypes.HEATMAP:
        opacity = $map.getPaintProperty(id, 'heatmap-opacity') as number
        break
      default:
        break
    }
    if (!opacity) {
      opacity = 1
    }
    return opacity
  }

  let layerOpacity = getLayerOpacity(layer)
  let rangeSliderValues = [layerOpacity * 100]

  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setOpacity()

  const setOpacity = () => {
    layer.children?.forEach((child: Layer) => {
      setLayerOpacity(child)
    })
    setLayerOpacity(layer)
  }

  const setLayerOpacity = (target: Layer) => {
    const id = target.id
    const style = getLayerStyle($map, target.id)
    if (!style) return
    switch (style.type) {
      case LayerTypes.RASTER:
        $map.setPaintProperty(id, 'raster-opacity', layerOpacity)
        break
      case LayerTypes.SYMBOL:
        $map.setPaintProperty(id, 'icon-opacity', layerOpacity)
        $map.setPaintProperty(id, 'text-opacity', layerOpacity)
        break
      case LayerTypes.LINE:
        $map.setPaintProperty(id, 'line-opacity', layerOpacity)
        break
      case LayerTypes.FILL:
        $map.setPaintProperty(id, 'fill-opacity', layerOpacity)
        break
      case LayerTypes.HEATMAP:
        $map.setPaintProperty(id, 'heatmap-opacity', layerOpacity)
        break
      default:
        break
    }
  }
</script>

<div
  class="action"
  data-testid="opacity-panel-container">
  <div class="range-slider">
    <RangeSlider
      bind:values={rangeSliderValues}
      float
      min={0}
      max={100}
      step={1}
      pips
      first="label"
      last="label"
      rest={false}
      suffix="%" />
  </div>
</div>

<style lang="scss">
  .action {
    margin-bottom: 25px;

    .range-slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
    }
  }
</style>
