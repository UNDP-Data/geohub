<script
  lang="ts"
  context="module">
  let rclState = {}
</script>

<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'

  import ColorMapPickerCard from '$components/controls/ColorMapPickerCard.svelte'
  import { COLOR_CLASS_COUNT, ColorMapTypes } from '$lib/constants'
  import {
    getActiveBandIndex,
    getLayerStyle,
    getValueFromRasterTileUrl,
    updateParamsInURL,
    getLayerSourceUrl,
    sleep,
  } from '$lib/helper'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { map } from '$stores'

  export let layerConfig: Layer
  export let colorMapName: string
  export let numberOfClasses

  const lUrl = getLayerSourceUrl($map, layerConfig.id) as string

  console.log('CONTINUOUS LEGEND', colorMapName)

  let info: RasterTileMetadata
  ;({ info } = layerConfig)

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

  const rescale = getValueFromRasterTileUrl($map, layerConfig.id, 'rescale') as number[]

  // this ensures the slider state is set to 1) rescale from url, 2 rescale state, 3 layermin/max
  let rangeSliderValues = rescale
    ? rescale
    : rclState['rescale']
    ? rclState['rescale']
    : ([layerMin, layerMax] as number[])

  let step = (layerMax - layerMin) * 1e-2

  // the reactive statement below will update map whenever the colormap changes or the legend was switched.
  // quite a tricky business
  // as the colorMapName is two way binded, this means next fucntion is loaded all the time
  // for this reason it makes a lot of sense to consider it a workhorse and do a lot of sanitation ans well

  $: colorMapName, colorMapNameChanged()
  const colorMapNameChanged = () => {
    const currCMAP = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap_name') as string

    // invalid cases
    if (!colorMapName || currCMAP == colorMapName) {
      return
    }

    const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string
    if (!(layerUrl && layerUrl.length > 0)) {
      return
    }

    const layerURL = new URL(layerUrl)
    // remove colormap in case the layer was previously in
    if (layerURL.searchParams.has('colormap')) layerURL.searchParams.delete('colormap')

    // set color map and force map rerender
    layerURL.searchParams.delete('colormap_name')
    let updatedParams = Object.assign({ colormap_name: colorMapName })

    //for rescale the rangeSliderValue sis reactive and also intialized from three locations so this is used to poulate
    // the rescale at all times
    layerURL.searchParams.delete('rescale')
    updatedParams = Object.assign(updatedParams, { rescale: rangeSliderValues.join(',') })

    const layerStyle = getLayerStyle($map, layerConfig.id)
    updateParamsInURL(layerStyle, layerURL, updatedParams)
  }

  /**
   * please keep the next  fucntion here as It is not lcear whay it has been designed as such
   */

  // const rescaleColorMap = () => {
  //   if (!$map) return
  //   const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string
  //   const layerURL = new URL(layerUrl)
  //   if (!(layerUrl && layerUrl.length > 0)) return
  //   if (layerURL.searchParams.has('colormap')) {
  //     //console.log('rescale color map')
  //     let params = {}
  //     layerURL.searchParams.delete('colormap')
  //     if (!layerURL.searchParams.has('rescale')) {
  //       params = { rescale: rangeSliderValues.join(',') }
  //     } else {
  //       let rescaleParam = layerURL.searchParams.get('rescale')
  //       let rescaleMin = '',
  //         rescaleMax = ''
  //       ;[rescaleMin, rescaleMax] = rescaleParam.split(',')
  //       if (Number(rescaleMin) !== rangeSliderValues[0] || Number(rescaleMax) !== rangeSliderValues[1]) {
  //         params = { rescale: rangeSliderValues.join(',') }
  //       }
  //     }

  //     params = Object.assign(params, { colormap_name: colorMapName })
  //     Object.keys(params).forEach((key) => {
  //       layerURL.searchParams.set(key, params[key])
  //     })
  //     const layerStyle = getLayerStyle($map, layerConfig.id)
  //     updateParamsInURL(layerStyle, layerURL, params)
  //   }
  // }

  const onSliderStop = () => {
    const layerStyle = getLayerStyle($map, layerConfig.id)
    const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string
    if (!(layerUrl && layerUrl.length > 0)) return
    const layerURL = new URL(layerUrl)
    updateParamsInURL(layerStyle, layerURL, { rescale: rangeSliderValues.join(',') })
    rclState['rescale'] = rangeSliderValues
    console.log(rangeSliderValues.join('::'))
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
