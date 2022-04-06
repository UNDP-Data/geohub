<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import Chip, { Set, Text } from '@smui/chips'
  import chroma from 'chroma-js'

  import type { Layer, LayerInfo } from '../lib/types'
  import type {
    RasterLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { ColorMapTypes, LayerInitialValues } from '../lib/constants'
  import { map } from '../stores/index'
  import { ColorMaps } from '../lib/colormaps'
  import { updateParamsInURL } from '../lib/helper'

  export let activeColorMapName: string
  export let layerConfig: Layer = LayerInitialValues

  let definition: RasterLayerSpecification | LineLayerSpecification | FillLayerSpecification | SymbolLayerSpecification
  let info: LayerInfo
  ;({ definition, info } = layerConfig)

  const defaultNumberOfColors = 5
  const layerMax = Number(info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  const layerMin = Number(info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let activeColorMap: chroma.Scale = undefined
  let allColorMaps = {}
  let colorMapSelectionVisible = false
  let rangeSliderValues = [layerMin, layerMax]
  let selectedColorMapType = ''
  let step = (layerMax - layerMin) * 1e-2
  // let layerURL: URL

  $: {
    if (activeColorMapName !== '') {
      populateAllColorMaps()
      rescaleColorMap()
    }
  }

  const populateAllColorMaps = () => {
    for (let [cmapType, cMaps] of Object.entries(ColorMaps)) {
      let cmaps = {}
      cMaps.forEach((cmapstr: string) => {
        try {
          if (cmapType === ColorMapTypes.SEQUENTIAL) {
            cmaps[cmapstr] = chroma.scale(cmapstr).mode('lrgb').padding([0.25, 0]).domain([layerMin, layerMax])
          } else {
            cmaps[cmapstr] = chroma.scale(cmapstr).mode('lrgb').domain([layerMin, layerMax])
          }
        } catch (error) {
          console.log(`failed to process ${cmapstr} because ${error}`)
        }
        if (activeColorMapName === cmapstr) {
          activeColorMap = cmaps[cmapstr]
        }
      })

      allColorMaps[cmapType] = cmaps
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
      updateParamsInURL(definition, layerURL, params)
    }
  }
</script>

<div class="group">
  <div class="slider">
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
  {#if activeColorMap !== undefined}
    <div class="active-color-map">
      <div
        title={`Colormap: ${activeColorMapName}`}
        on:click={() => {
          colorMapSelectionVisible = !colorMapSelectionVisible
        }}
        class="chroma-test"
        style="background: linear-gradient(90deg, {activeColorMap.colors(
          defaultNumberOfColors,
          'rgba',
        )}); cursor: pointer;" />
      <div class="chroma-test">
        <div>
          <div>
            Min: {rangeSliderValues[0]}
          </div>

          <div>
            Max: {rangeSliderValues[1]}
          </div>
        </div>
      </div>
    </div>
  {/if}
  <div class={colorMapSelectionVisible ? 'cmap-selection shown' : 'cmap-selection hidden'}>
    <Set class="colormap-chips" chips={Object.keys(ColorMaps)} let:chip choice bind:selected={selectedColorMapType}>
      <Chip {chip}>
        <Text>{chip}</Text>
      </Chip>
    </Set>
    <div>
      <div class="colormaps-group">
        {#if selectedColorMapType}
          {#each Object.keys(allColorMaps[selectedColorMapType]) as aColorMap}
            <div
              class="colormap-div"
              title={aColorMap}
              on:click={() => {
                activeColorMapName = aColorMap
                activeColorMap = allColorMaps[selectedColorMapType][aColorMap]
                updateParamsInURL(definition, layerURL, { colormap_name: activeColorMapName })
              }}
              style="background: linear-gradient(90deg, {allColorMaps[selectedColorMapType][aColorMap].colors(
                defaultNumberOfColors,
                'rgba',
              )})" />
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .group {
    background: #f0f0f0;
    border-radius: 7.5px;
    padding: 2px;

    @media (prefers-color-scheme: dark) {
      background: #323234;
      color: white;
    }

    .slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
      width: calc(90% - 4px);
      padding-left: calc(10% + 4px);
    }

    .active-color-map {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .chroma-test {
      height: 20px;
      width: 80%;
      align-items: center;
      justify-content: space-between;

      div {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
    }

    .cmap-selection {
      display: block;

      .colormap-div {
        height: 20px;
        width: 80%;
        cursor: pointer;
        justify-content: center;
        margin: 1px;
      }
    }

    .hidden {
      display: none;
    }
  }

  :global(.changeLegendButtonDiv) {
    margin: 0 auto;
    padding-top: 10px;
    width: 80%;
    display: flex;
  }

  :global(.changelegendbtn) {
    text-transform: capitalize;
    height: 30px;
    width: 100%;
  }

  * :global(.colormaps-group) {
    margin: auto;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }

  * :global(.colormap-chips) {
    justify-content: space-evenly;
  }
</style>
