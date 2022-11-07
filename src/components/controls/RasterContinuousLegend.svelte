<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import { onMount } from 'svelte'
  import type {
    RasterLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
    RasterTileSource,
  } from 'maplibre-gl'

  import ColorMapPickerCard from '$components/controls/ColorMapPickerCard.svelte'
  import { COLOR_CLASS_COUNT, ColorMapTypes, LayerInitialValues } from '$lib/constants'
  import { getActiveBandIndex, getValueFromRasterTileUrl, updateParamsInURL } from '$lib/helper'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { map } from '$stores'

  export let layerConfig: Layer = LayerInitialValues

  let definition:
    | RasterLayerSpecification
    | LineLayerSpecification
    | FillLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info: RasterTileMetadata
  ;({ definition, info } = layerConfig)
  let activeColorMapName = layerConfig.colorMapName
  let layerMin = NaN
  let layerMax = NaN

  const bandIndex = getActiveBandIndex(info)
  if ('stats' in info) {
    const band = Object.keys(info.stats)[bandIndex]
    layerMin = Number(info.stats[band].min)
    layerMax = Number(info.stats[band].max)
  } else {
    const [band, bandMetaStats] = info['band_metadata'][bandIndex]
    layerMin = Number(bandMetaStats['STATISTICS_MINIMUM'])
    layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM'])
  }

  const layerSrc: RasterTileSource = $map.getSource(definition.source) as RasterTileSource
  const layerURL = new URL(layerSrc.tiles[0])

  let numberOfClasses = layerConfig.intervals.numberOfClasses || COLOR_CLASS_COUNT

  const rescale = getValueFromRasterTileUrl($map, layerConfig.id, 'rescale') as number[]

  // this ensures the slider state is set to layer min max
  let rangeSliderValues = rescale ? rescale : [layerMin, layerMax]

  let step = (layerMax - layerMin) * 1e-2

  // the reactive statement below will update map whenever the colormap changes or the legend was switched.
  // quite a tricky business

  $: {
    if (activeColorMapName !== layerConfig.colorMapName || (layerURL.searchParams.has('colormap') && layerConfig)) {
      //if (activeColorMapName !== layerConfig.colorMapName || layerConfig) {
      //console.log(`layerURL has changed ${layerURL.searchParams.get('rescale')} ${layerMin} - ${layerMax}` )
      rescaleColorMap()
      updateParamsInURL(definition, layerURL, { colormap_name: layerConfig.colorMapName })
      activeColorMapName = layerConfig.colorMapName // this re-renders the continuous legend
      layerConfig.intervals.colorMapRows = [] // this re-remders the intervals legend classes properly
    }
  }

  onMount(() => {
    // pass
  })

  const rescaleColorMap = () => {
    if (layerURL.searchParams.has('colormap')) {
      //console.log('rescale color map')
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
  const onSliderStop = () => {
    updateParamsInURL(definition, layerURL, { rescale: rangeSliderValues.join(',') })
  }
</script>

<div
  class="group"
  data-testid="continuous-view-container">
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
      on:stop={onSliderStop} />
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
