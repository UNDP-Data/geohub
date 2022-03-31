<!-- <script lang="ts" context="module">
  
</script> -->
<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import type { Layer, LayerDefinition, LayerInfo } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import RangeSlider from 'svelte-range-slider-pips'
  import Chip, { Set, Text } from '@smui/chips'
  import { map } from '../stores/index'
  import { ColorMaps } from '../lib/colormaps'
  import chroma from 'chroma-js'

  //variables
  //layer config prop
  export let layerConfig: Layer = LayerInitialValues
  export let activeColorMapName
  let name: string
  let definition: LayerDefinition
  let type: string
  let info: LayerInfo
    //descructured
  ;({ name, definition, type, info } = layerConfig)

  const layerMin = Number(info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  const layerMax = Number(info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  let layerUniqueValues: Array<number> = info['band_metadata'][0][1]['STATISTICS_UNIQUE_VALUES'].sort()

  //console.log(layerMin, layerMax, layerUniqueValues)

  //slider vars, intialized to Layer min/max
  let rangeSliderValues = [layerMin, layerMax]
  let step = (layerMax - layerMin) / (layerUniqueValues.length - 1)

  //console.log(rangeSliderValues, step)

  const layerSrc = $map.getSource(definition.source)
  let layerURL = new URL(layerSrc.tiles[0])
  let activeColorMap: chroma.Scale = undefined
  //let activeColorMapName: string = getContext(layerId) || layerURL.searchParams.get('colormap_name') || 'viridis'

  let allColorMaps = {}
  const defaultNumberOfColors = 5

  let colorMapSelectionVisible = false

  let selectedColorMapType = ''

  //populate allColorMaps with scale/colors
  for (let [cmapType, cMaps] of Object.entries(ColorMaps)) {
    let cmaps = {}
    cMaps.forEach((cmapstr: string) => {
      try {
        if (cmapType == 'sequential') {
          cmaps[cmapstr] = chroma.scale(cmapstr).mode('lrgb').padding([0.25, 0]).domain([layerMin, layerMax])
          //.colors(nColors, 'rgba')
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
    Object.keys(params).forEach((key) => {
      layerURL.searchParams.set(key, params[key])
    })
    refreshLayerURL()
  }

  const remap = (input = 0, oldMin = 0, oldMax = 0, newMin = 0, newMax = 255) => {
    const percent = (input - oldMin) / (oldMax - oldMin)
    const rescaled = percent * (newMax - newMin) + newMin
    return rescaled | 0
  }

  const setUniqueValueLegend = (params = {}) => {
    console.log(`setting Unique values legend for ${name} with ${activeColorMapName}`)

    let cmapObject = {}
    layerUniqueValues.forEach((key) => {
      let c = [...activeColorMap(key).rgb(), 255]
      //console.log(activeColorMap(key).rgb(), i, key, c)
      //cmapObject[remap(key, layerUniqueValues[0], layerUniqueValues[layerUniqueValues.length - 1])] = c
      cmapObject[remap(key, rangeSliderValues[0], rangeSliderValues[1])] = c
    })

    let encodedCmap = JSON.stringify(cmapObject)
    console.log(encodedCmap)
    layerURL.searchParams.delete('colormap_name')
    //layerURL.searchParams.delete('rescale')
    let updatedParams = Object.assign({ colormap: encodedCmap }, params)
    updateParamsInURL(updatedParams)
  }

  const handleRangeSlider = () => {
    console.log(layerUniqueValues, rangeSliderValues)
    // check unique values list against slider
    let sliderMin = rangeSliderValues[0]
    let sliderMax = rangeSliderValues[1]
    let uvMin = Math.min(...layerUniqueValues)
    let uvMax = Math.max(...layerUniqueValues)

    if (sliderMin != uvMin) {
      if (sliderMin > uvMin) {
        layerUniqueValues = layerUniqueValues.filter((el) => el >= sliderMin)
      } else {
        layerUniqueValues = [sliderMin, ...layerUniqueValues]
      }
    }

    if (sliderMax != uvMax) {
      if (sliderMax < uvMax) {
        layerUniqueValues = layerUniqueValues.filter((el) => el <= sliderMax)
      } else {
        layerUniqueValues = [...layerUniqueValues, sliderMax]
      }
    }

    activeColorMap = activeColorMap.domain(rangeSliderValues)

    setUniqueValueLegend({ rescale: rangeSliderValues.join(',') })
  }

  $: layerURL, console.log(`${layerURL.toString()}`)
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
      on:stop={() => {
        handleRangeSlider()
      }} />
  </div>
  <div class="uvalues-legend">
    <div class="column">
      <div class="row">Active color map</div>

      <div class="row">
        <Button
          on:click={() => {
            colorMapSelectionVisible = !colorMapSelectionVisible
          }}
          variant="raised">
          <LabelButton>{activeColorMapName}</LabelButton>
        </Button>
      </div>
    </div>

    <div class="column">
      <div class="row">Values:</div>

      <div
        class="row"
        style="display: flex; align-items: center; justify-content: space-around; 
        flex-direction: column; background-color: white; border-radius: 5px; padding: 10px">
        <div style="display: block">
          {#each activeColorMap.colors(layerUniqueValues.length, 'rgba') as value, index}
            <div style="display: flex; padding:2px;">
              <div class="discrete" style="background-color: {value}" />
              &nbsp;&raquo;&nbsp
              <div>{layerUniqueValues[index]}</div>
            </div>
          {/each}
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
                setUniqueValueLegend()
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
  .row {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    border: 0px dashed;
    justify-content: center;
    align-items: center;
  }
  .column {
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    align-items: center;
    flex: 1;
  }
  .uvalues-legend {
    display: flex;
    flex-direction: rows;
    align-items: stretch;
    // height: 100%;
    border: 0px solid red;
  }
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

    .slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
      width: calc(90% - 4px);
      padding-left: calc(10% + 4px);
    }
  }

  .discrete {
    width: 20px;
    height: 20px;
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
