<script lang="ts">
  import chroma from 'chroma-js'
  import Button, { Label as LabelButton } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'
  import Ripple from '@smui/ripple'
  import Fa from 'svelte-fa'
  import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft'
  import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight'
  import type {
    FillLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  //import ColorPicker from './controls/ColorPicker.svelte'
  import ColorPicker from 'svelte-awesome-color-picker/ColorPicker.svelte'

  import { map } from '../stores'
  import { ColorMaps } from '../lib/colormaps'
  import type { Layer, LayerInfo, Color } from '../lib/types'
  import { ClassificationMethodTypes, ColorMapTypes, LayerInitialValues } from '../lib/constants'
  import { updateParamsInURL } from '../lib/helper'

  export let layerConfig: Layer = LayerInitialValues
  export let activeColorMapName: string

  let definition: RasterLayerSpecification | FillLayerSpecification | LineLayerSpecification | SymbolLayerSpecification
  let info: LayerInfo
  ;({ definition, info } = layerConfig)

  const defaultNumberOfColors = 5
  const layerMin = Number(info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  const layerMax = Number(info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let activeColorMap: chroma.Scale = undefined
  let allColorMaps = {}
  let colorMapSelectionVisible = false
  let intervalList = []
  let cmap = []
  let cmapItem = []
  let numberOfClasses = 5
  let rangeSliderValues = [layerMin, layerMax]
  let selectedClassificationMethod = ClassificationMethodTypes.EQUIDISTANT
  let selectedColorMapType = ''

  let classificationMethods = [
    { name: 'Equidistant', value: 'e' },
    { name: 'Quantile', value: 'q' },
  ]
  if (layerMin > 0) {
    classificationMethods.push({ name: 'Logarithmic', value: 'l' })
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

  const reclassifyImage = () => {
    intervalList = chroma.limits(rangeSliderValues, selectedClassificationMethod, numberOfClasses).map((element) => {
      return Number(element.toFixed(2))
    })

    let scaleColorList = chroma.scale(activeColorMapName).classes(intervalList)
    if (cmap.length > 0) {
      cmap = []
    }
    for (let i = 0; i <= numberOfClasses - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      let c = [...scaleColorList(intervalList[i]).rgb(), 255]
      let intervalStart = intervalList[i]
      let intervalEnd = intervalList[i + 1]
      let cmapitem = [[intervalStart, intervalEnd], c]
      cmap.push(cmapitem)
    }
    handleParamsUpdate(cmap)
    //generateBGColors(cmap)
  }

  const handleParamsUpdate = (cmap: object) => {
    let encodedCmap = JSON.stringify(cmap)
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    let updatedParams = Object.assign({ colormap: encodedCmap })
    updateParamsInURL(definition, layerURL, updatedParams)
  }

  const handleNumberOfClasses = (operation: string, minNoOfClasses = 2, maxNoOfClasses = 25) => {
    if (operation === 'increment') {
      if (numberOfClasses <= maxNoOfClasses) {
        numberOfClasses++
      }
    }
    if (operation === 'decrement') {
      if (numberOfClasses > minNoOfClasses) {
        numberOfClasses--
      }
    }
    reclassifyImage()
  }

  let openColorPicker = false
  let currentIntervalColor: string[]
  let currentIntervalColorRGB: string
  let intervalIndex: number
  let color: Color

  function sendIndexForCmap(index: number) {
    openColorPicker = !openColorPicker
    currentIntervalColor = cmap[index][1]

    let r = currentIntervalColor[0]
    let g = currentIntervalColor[1]
    let b = currentIntervalColor[2]

    color = {
      r: r,
      g: g,
      b: b,
      hex: chroma([r, g, b]).hex('rgba'),
      h: chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }

    currentIntervalColorRGB = `rgb(${currentIntervalColor[0]},${currentIntervalColor[1]},${currentIntervalColor[2]})`
    intervalIndex = index
  }

  function updateColorMap(index: number, color: Color) {
    if (cmapItem.length > 0) {
      cmapItem = []
    }

    cmap[index].splice(1, 1, chroma(color['hex']).rgba())
    cmap[index][1].splice(3, 1, rescaleOpacity(cmap[index][1][3]))
    cmapItem = cmap[index]

    handleParamsUpdate(cmap)
    document.getElementById(`interval-${index}`).style.background = `rgb(${chroma(color['hex']).rgba()})`
  }

  function rescaleOpacity(opacity: number) {
    return 255 * opacity
  }

  $: {
    if (openColorPicker) {
      currentIntervalColor, updateColorMap(intervalIndex, color)
    }
  }
  /*
  Todo: Please don't remove this block; To be revisited
  let bgColors = []
  let currentRGB;
  const generateBGColors = (cmap) => {
    if(bgColors.length > 0){
      bgColors = []
    }else{
      cmap.forEach((value, index) => {
        bgColors.push(`rgb(${value[1][0]}, ${value[1][1]}, ${value[1][2]})`)
      })
      console.log(bgColors)
    }
  }
  bgColors.forEach((item, index) => {
    currentRGB = item
  })
   */

  const sendFirstInterval = (index: number, item: string) => {
    if (item > cmap[index][0][1]) {
      console.warn(
        'That is not allowed!! Please make sure your intervals follow the right order to see your changes on the map',
      )
    } else {
      cmap[index][0].splice(0, 1, Number(item))
      console.log(cmap)
      handleParamsUpdate(cmap)
    }
  }
  const sendLastInterval = (index: number, item: string) => {
    if (item < cmap[index + 1][0][1]) {
      cmap[index][0].splice(1, 1, Number(item))
      cmap[index + 1][0].splice(0, 1, Number(item))
      handleParamsUpdate(cmap)
    } else {
      console.warn(
        'That is not allowed!! Please make sure your intervals follow the right order to see your changes on the map',
      )
    }
  }

  // This is causing the ma to be reloaded every time
  $: {
    if (activeColorMapName) {
      populateAllColorMaps()
      reclassifyImage()
    }
    if (selectedClassificationMethod) {
      reclassifyImage()
    }
  }
</script>

<div class="group">
  <div class="intervals-legend">
    <div class="row">
      <div class="column">Number of classes:</div>
      <div class="column">
        <div class="no-classes">
          <div
            class="icon-selected"
            title="Increase number of classes"
            on:click={() => {
              handleNumberOfClasses('decrement')
            }}>
            <Fa icon={faCaretLeft} size="2x" style="transform: scale(1); padding-right:2px" />
          </div>
          <input type="text" bind:value={numberOfClasses} size="1" style="text-align:center;" />
          <div
            class="icon-selected"
            title="Decrese number of classes"
            on:click={() => {
              handleNumberOfClasses('increment')
            }}>
            <Fa icon={faCaretRight} size="2x" style="transform: scale(1); padding-left: 2px ;" />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="column">Classification:</div>
      <div class="column">
        <select
          bind:value={selectedClassificationMethod}
          id="class-mode"
          on:change={() => {
            reclassifyImage
          }}>
          {#each classificationMethods as classificationMethod}
            <option value={classificationMethod.value}>{classificationMethod.name}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <div class="column">
    <div id="intervals-cmap-button-div">
      <div>Active colormap</div>
      <Button
        id="intervals-cmap-button"
        on:click={() => {
          colorMapSelectionVisible = !colorMapSelectionVisible
        }}
        variant="raised"
        style="background:linear-gradient(90deg, {[...activeColorMap.colors()]})">
        <LabelButton style="text-transform: lowercase">{activeColorMapName}</LabelButton>
      </Button>
    </div>

    <!-- Todo: Please dont delete this block. To be revisited
    <div class="column" id="intervals-list-div">
      {#each bgColors as value, index}
        <div style="display: flex; padding:2px; width: 50%; margin: auto">
          <ColorPicker class='colorpicker' bind:RgbColor={value} />
          &nbsp;&raquo;&nbsp
          <div contenteditable="true" bind:innerHTML={intervalList[index]} />
          -
          <div contenteditable="true" bind:innerHTML={intervalList[index+1]} />
        </div>
      {/each}
    </div>
    Todo: ending here
    -->

    <div class="column" id="intervals-list-div">
      {#each cmap as value, index}
        <div style="display: flex; padding:2px; width: 50%; margin: auto">
          <div
            id="interval-{index}"
            on:click={() => sendIndexForCmap(index)}
            class="discrete"
            style="caret-color:rgb({cmap[index][1]}); cursor:pointer; background-color: rgb({cmap[index][1]})" />
          &nbsp;&raquo;&nbsp
          <input
            style="width: 30px!important; border: none"
            bind:value={intervalList[index]}
            on:change={sendFirstInterval(index, intervalList[index])} />
          -
          <input
            style="width: 30px!important; border: none"
            bind:value={intervalList[index + 1]}
            on:change={sendLastInterval(index, intervalList[index + 1])} />
        </div>
      {/each}
      {#if openColorPicker}
        <div style="cursor: crosshair">
          <ColorPicker
            isPopup={true}
            wrapper="div"
            --picker-height="150px"
            --picker-width="150px"
            --slider-width="10px"
            isInput={false}
            isOpen={true}
            bind:color />
        </div>
      {/if}
    </div>
  </div>
  <div class={colorMapSelectionVisible ? 'cmap-selection shown' : 'cmap-selection hidden'}>
    <Set class="colormap-chips" chips={Object.keys(ColorMaps)} let:chip choice bind:selected={selectedColorMapType}>
      <Chip {chip} style="margin-left: 0; margin-right: 0;">
        <Text style="font-family: ProximaNova, sans-serif;">{chip.charAt(0).toUpperCase() + chip.slice(1)}</Text>
      </Chip>
    </Set>
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
              reclassifyImage
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

<style lang="scss">
  .group {
    border-radius: 7.5px;
    padding: 2px;
    margin-top: 1px;
    padding-bottom: 4px;

    @media (prefers-color-scheme: dark) {
      background: #323234;
      color: white;
    }

    .intervals-legend {
      display: flex;
      flex-direction: column;
      align-items: stretch;

      border: 0px solid red;

      .row {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 100%;
        border: 0px dashed;
        justify-content: center;
        align-items: center;
      }
    }

    .column {
      display: block;
      flex-direction: column;
      flex-basis: 100%;
      align-items: center;
      flex: 1;
      border: 0px solid red;

      #intervals-cmap-button-div {
        width: 50%;
        height: 100%;
        margin: auto;
      }

      #intervals-list-div {
        background-color: white;
        width: 100%;
        margin: auto;

        @media (prefers-color-scheme: dark) {
          background: #323234;
          color: white;
        }

        .discrete {
          width: 20px;
          height: 20px;
        }
      }

      .no-classes {
        display: flex;
        flex-direction: row;
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
    display: block;
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

  * :global(#intervals-cmap-button) {
    margin-bottom: 2rem;
    width: 100%;
    height: 100%;
  }

  * :global(.color-picker-handle) {
    border-radius: 0 !important;
    height: 20px !important;
    width: 20px !important;
  }
</style>
