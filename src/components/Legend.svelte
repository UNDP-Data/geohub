<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import Chip, { Set, Text } from '@smui/chips'
  import chroma from 'chroma-js'

  import type { Layer, LayerDefinition, LayerInfo } from '../lib/types'
  import { ColorMapTypes, LayerInitialValues } from '../lib/constants'
  import { map } from '../stores/index'
  import { ColorMaps } from '../lib/colormaps'

  export let activeColorMapName = ''
  export let layerConfig: Layer = LayerInitialValues

  let definition: LayerDefinition
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

  const refreshLayerURL = () => {
    $map.getSource(definition.source).tiles = [decodeURI(layerURL.toString())]
    $map.style.sourceCaches[definition.source].clearTiles()
    $map.style.sourceCaches[definition.source].update($map.transform)
    $map.triggerRepaint()
  }

  const updateParamsInURL = (params) => {
    console.log('updating')
    Object.keys(params).forEach((key) => {
      layerURL.searchParams.set(key, params[key])
    })
    refreshLayerURL()
  }
  if (layerURL.searchParams.has('colormap')) {
    layerURL.searchParams.delete('colormap')
    updateParamsInURL({ colormap_name: activeColorMapName })
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
      on:stop={updateParamsInURL({ rescale: rangeSliderValues.join(',') })} />
  </div>
  <div style="display:flex;flex-direction:column; align-items:center">
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
    <div style="align-items: center; justify-content: space-between" class="chroma-test">
      <div style="display: flex; flex-direction: row; justify-content: space-between">
        <div>
          Min: {rangeSliderValues[0]}
        </div>

        <div>
          Max: {rangeSliderValues[1]}
        </div>
      </div>
    </div>
  </div>
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

                updateParamsInURL({ colormap_name: activeColorMapName })
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
  .colormap-div {
    height: 20px;
    width: 80%;
    cursor: pointer;
    justify-content: center;
    margin: 1px;
  }
  .group {
    background: #f0f0f0;
    border-radius: 7.5px;
    padding: 2px;
    //margin-top: 1px;
    //padding-bottom: 4px;

    @media (prefers-color-scheme: dark) {
      background: #212125;
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
  }

  :global(.changeLegendButtonDiv) {
    margin: 0 auto;
    padding-top: 10px;
    width: 80%;
    display: flex;
  }
  .chroma-test {
    height: 20px;
    width: 80%;
  }
  :global(.changelegendbtn) {
    text-transform: capitalize;
    height: 30px;
    width: 100%;
  }
  .cmap-selection {
    display: block;
  }

  .hidden {
    display: none;
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
