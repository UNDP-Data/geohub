<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import FormField from '@smui/form-field'
  import Radio from '@smui/radio'
  import Ripple from '@smui/ripple'
  import chroma from 'chroma-js'
  import type { MenuSurfaceComponentDev } from '@smui/menu-surface'
  import MenuSurface from '@smui/menu-surface'
  import type { Layer, LayerInfo } from '../lib/types'
  import type {
    RasterLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { ColorMapTypes, LayerInitialValues } from '../lib/constants'
  import { map } from '../stores'
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
  let step = (layerMax - layerMin) * 1e-2
  let selectedColorMapType = 'sequential'
  let surface: MenuSurfaceComponentDev

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
      Object.keys(params).forEach((key) => {
        layerURL.searchParams.set(key, params[key])
      })
      updateParamsInURL(definition, layerURL, params)
    }
  }

  $: {
    if (activeColorMapName) {
      populateAllColorMaps()
      rescaleColorMap()
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
          surface.setOpen(true)
        }}
        class="chroma-test"
        style="background: linear-gradient(90deg, {activeColorMap.colors(
          defaultNumberOfColors,
          'rgba',
        )}); cursor: pointer;" />
      <MenuSurface
        bind:this={surface}
        anchorCorner="BOTTOM_LEFT"
        style="max-height: 200px; overflow-y: scroll; margin-top: 10px; width: 100%">
        <div class={colorMapSelectionVisible ? 'cmap-selection shown' : 'cmap-selection hidden'}>
          <div class="radio-demo" style="display: flex; width: 100%; justify-content: space-around">
            {#each Object.keys(ColorMaps) as option}
              <FormField>
                <Radio bind:group={selectedColorMapType} value={option} touch />
                <span
                  slot="label"
                  style="font-size: 9px; font-weight: normal; font-family: ProximaNova, sans-serif; text-transform: none;"
                  >{option}</span>
              </FormField>
            {/each}
          </div>
          <div class="colormaps-group">
            {#if selectedColorMapType}
              {#each Object.keys(allColorMaps[selectedColorMapType]) as aColorMap}
                <div
                  use:Ripple={{ surface: true }}
                  class="colormap-div"
                  title={aColorMap}
                  on:click={() => {
                    activeColorMapName = aColorMap
                    activeColorMap = allColorMaps[selectedColorMapType][aColorMap]
                    updateParamsInURL(definition, layerURL, { colormap_name: aColorMap })
                  }}
                  style="background: linear-gradient(90deg, {allColorMaps[selectedColorMapType][aColorMap].colors(
                    defaultNumberOfColors,
                    'rgba',
                  )})" />
              {/each}
            {/if}
          </div>
        </div>
      </MenuSurface>
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
</div>

<style lang="scss">
  .group {
    border-radius: 7.5px;
    padding: 2px;
    padding-left: 0;
    padding-right: 0;

    @media (prefers-color-scheme: dark) {
      background: #323234;
      color: white;
    }

    .slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
      width: calc(100% - 4px);
      // padding-left: calc(10% + 4px);
    }

    .active-color-map {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 10px;
      padding-bottom: 10px;

      .chroma-test {
        height: 20px;
        width: 100%;
        align-items: center;
        justify-content: space-between;

        div {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
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
    padding-left: 0;
    padding-right: 0;
  }

  * :global(.mdc-radio) {
    padding: 0;
    margin: 0;
  }
  * :global(.mdc-radio__native-control) {
    height: 20px;
    width: 20px;
    padding: 10px;
  }

  * :global(::-webkit-scrollbar) {
    width: 5px;
    padding: 0;
    margin: 0;
  }
  * :global(::-webkit-scrollbar-thumb) {
    background: grey;
    border-radius: 10px;
  }
</style>
