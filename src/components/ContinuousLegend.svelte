<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import type {
    RasterLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { debounce } from 'lodash-es'

  import ColorMapPickerCard from '$components/ColorMapPickerCard.svelte'
  import { COLOR_CLASS_COUNT, ColorMapTypes, LayerInitialValues } from '$lib/constants'
  import { updateParamsInURL } from '$lib/helper'
  import type { Layer, LayerInfo } from '$lib/types'
  import { map } from '$stores'

  export let layerConfig: Layer = LayerInitialValues

  let definition:
    | RasterLayerSpecification
    | LineLayerSpecification
    | FillLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info: LayerInfo
  ;({ definition, info } = layerConfig)
  let activeColorMapName = layerConfig.colorMapName

  const numberOfClasses = COLOR_CLASS_COUNT
  const layerMax = Number(info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  const layerMin = Number(info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let rangeSliderValues = [layerConfig.continuous.minimum, layerConfig.continuous.maximum] || [layerMin, layerMax]
  let step = (layerMax - layerMin) * 1e-2

  $: rangeSliderValues, setSliderState()
  $: {
    if (layerConfig) {
      activeColorMapName = layerConfig.colorMapName
      rescaleColorMap()
      updateParamsInURL(definition, layerURL, { colormap_name: layerConfig.colorMapName })
    }
  }

  const rescaleColorMap = () => {
    if (layerURL.searchParams.has('colormap')) {
      let params = {}
      layerURL.searchParams.delete('colormap')
      if (!layerURL.searchParams.has('rescale')) {
        params = { rescale: rangeSliderValues.join(',') }
      } else {
        let rescaleParam = layerURL.searchParams.get('rescale')
        let rescaleMin = '',
          rescaleMax = ''
        ;[rescaleMin, rescaleMax] = rescaleParam.split(',')
        if (Number(rescaleMin) !== rangeSliderValues[0] || Number(rescaleMax) !== rangeSliderValues[1]) {
          params = { rescale: rangeSliderValues.join(',') }
        }
      }

      params = Object.assign(params, { colormap_name: activeColorMapName })
      Object.keys(params).forEach((key) => {
        layerURL.searchParams.set(key, params[key])
      })
      updateParamsInURL(definition, layerURL, params)
    }
  }

  const setSliderState = () => {
    debounce(() => {
      layerConfig.continuous.minimum = rangeSliderValues[0]
      layerConfig.continuous.maximum = rangeSliderValues[1]
    }, 500)
  }
</script>

<div class="group" data-testid="continous-view-container">
  <div class="active-color-map">
    <ColorMapPickerCard
      colorMapName={activeColorMapName}
      colorMapType={ColorMapTypes.SEQUENTIAL}
      {layerMax}
      {layerMin}
      {numberOfClasses}
      isSelected={false}
      isCardStyle={false} />
  </div>

  <div class="range-slider">
    <RangeSlider
      bind:values={rangeSliderValues}
      float
      range
      min={layerMin}
      max={layerMax}
      {step}
      pips
      pipstep={Math.round(step * 10)}
      first="label"
      last="label"
      rest={false}
      on:stop={updateParamsInURL(definition, layerURL, { rescale: rangeSliderValues.join(',') })} />
  </div>
</div>

<style lang="scss">
  :global(.rangeNub) {
    cursor: pointer;
  }

  .group {
    padding: 2px;

    @media (prefers-color-scheme: dark) {
      background: #323234;
      color: white;
    }

    .range-slider {
      --range-handle-focus: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
      --range-range-inactive: #2196f3;
      margin: 0;
    }

    .active-color-map {
      padding-bottom: 10px;
      padding-top: 4px;
    }
  }
</style>
