<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import { onMount } from 'svelte'
  import type { RasterTileSource } from 'maplibre-gl'

  import ColorMapPickerCard from '$components/controls/ColorMapPickerCard.svelte'
  import { COLOR_CLASS_COUNT, ColorMapTypes } from '$lib/constants'
  import { getActiveBandIndex, getLayerStyle, getValueFromRasterTileUrl, updateParamsInURL } from '$lib/helper'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { map } from '$stores'

  export let layerConfig: Layer

  let info: RasterTileMetadata
  ;({ info } = layerConfig)
  export let colorMapName: string
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

  export let numberOfClasses = COLOR_CLASS_COUNT

  const rescale = getValueFromRasterTileUrl($map, layerConfig.id, 'rescale') as number[]

  // this ensures the slider state is set to layer min max
  let rangeSliderValues = rescale ? rescale : [layerMin, layerMax]

  let step = (layerMax - layerMin) * 1e-2

  // the reactive statement below will update map whenever the colormap changes or the legend was switched.
  // quite a tricky business
  $: colorMapName, colorMapNameChanged()
  const colorMapNameChanged = () => {
    if (!colorMapName) return
    const layerSrc: RasterTileSource = $map.getSource(getLayerStyle($map, layerConfig.id).source) as RasterTileSource
    if (!(layerSrc && layerSrc.tiles && layerSrc.tiles.length > 0)) return
    const layerURL = new URL(layerSrc.tiles[0])
    if (layerURL.searchParams.has('colormap') && layerConfig) {
      rescaleColorMap()
    }
  }

  onMount(() => {
    // pass
  })

  const rescaleColorMap = () => {
    if (!$map) return
    const layerSrc: RasterTileSource = $map.getSource(getLayerStyle($map, layerConfig.id).source) as RasterTileSource
    const layerURL = new URL(layerSrc.tiles[0])
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

      params = Object.assign(params, { colormap_name: colorMapName })
      Object.keys(params).forEach((key) => {
        layerURL.searchParams.set(key, params[key])
      })
      const layerStyle = getLayerStyle($map, layerConfig.id)
      updateParamsInURL(layerStyle, layerURL, params)
    }
  }
  const onSliderStop = () => {
    const layerStyle = getLayerStyle($map, layerConfig.id)
    const layerSrc: RasterTileSource = $map.getSource(layerStyle.source) as RasterTileSource
    const layerURL = new URL(layerSrc.tiles[0])
    updateParamsInURL(layerStyle, layerURL, { rescale: rangeSliderValues.join(',') })
  }
</script>

<div
  class="group"
  data-testid="continuous-view-container">
  <div class="active-color-map">
    <ColorMapPickerCard
      {colorMapName}
      colorMapType={ColorMapTypes.SEQUENTIAL}
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
