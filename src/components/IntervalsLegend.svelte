<script lang="ts">
  import chroma from 'chroma-js'
  import Ripple from '@smui/ripple'
  import type {
    FillLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  //import ColorPicker from './controls/ColorPicker.svelte'
  import ColorPicker from 'svelte-awesome-color-picker/ColorPicker.svelte'
  import type { MenuSurfaceComponentDev } from '@smui/menu-surface'
  import MenuSurface from '@smui/menu-surface'
  import { map } from '$stores'
  import { ColorMaps } from '$lib/colormaps'
  import type { Layer, LayerInfo, Color } from '$lib/types'
  import { ClassificationMethodTypes, ColorMapTypes, LayerInitialValues } from '$lib/constants'
  import { updateParamsInURL } from '$lib/helper'
  import FormField from '@smui/form-field'
  import Radio from '@smui/radio'

  export let layerConfig: Layer = LayerInitialValues
  export let activeColorMapName: string

  let definition:
    | RasterLayerSpecification
    | FillLayerSpecification
    | LineLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
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
  let selectedColorMapType = 'sequential'
  let surface: MenuSurfaceComponentDev
  //let colorMapType = 'On';

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

  // This is causing the map to be reloaded every time
  $: {
    if (activeColorMapName) {
      populateAllColorMaps()
      reclassifyImage()
    }
    if (selectedClassificationMethod) {
      reclassifyImage()
    }
  }
  const range = (start, end) => Array.from(Array(end + 1).keys()).slice(start)
</script>

<div class="column">
  <div class="row" id="class-and-method-control-div">
    <div class="column" style="padding: 0">
      <select
        id="method"
        bind:value={selectedClassificationMethod}
        on:change={() => {
          reclassifyImage
        }}>
        <option value="" disabled selected>Classification</option>
        {#each classificationMethods as classificationMethod}
          <option value={classificationMethod.value}>{classificationMethod.name}</option>
        {/each}
      </select>
    </div>
    <div class="column">
      <div class="no-classes">
        <select
          bind:value={numberOfClasses}
          on:change={() => {
            reclassifyImage()
          }}>
          <option value="" disabled selected>Classes</option>
          {#each range(2, 15) as _, value}
            <option {value}>{value}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
  <div class="row" id="intervals-cmap-div">
    <div class="column" style="padding: 0; width: 80%">
      {#each cmap as value, index}
        <div style="display: flex; padding:2px; width: 100%;">
          <div
            id="interval-{index}"
            on:click={() => sendIndexForCmap(index)}
            class="discrete"
            style="width:20px; height:20px; caret-color:rgb({cmap[
              index
            ][1]}); cursor:pointer; background-color: rgb({cmap[index][1]})" />
          &nbsp;&raquo;&nbsp
          <input
            style="width: 50px!important; border: none"
            bind:value={intervalList[index]}
            on:change={sendFirstInterval(index, intervalList[index])} />
          -
          <input
            style="width: 50px!important; border: none"
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
    <div class="column">
      <div
        title="Current colormap. Click to change."
        id="current-colormap"
        style="cursor:pointer; width: 20px; min-height: 120px!important; height:100%; margin-left: 50%; background:linear-gradient(1deg, {[
          ...activeColorMap.colors(),
        ]}); "
        on:click={() => {
          colorMapSelectionVisible = !colorMapSelectionVisible
          surface.setOpen(true)
        }}
        use:Ripple={{ surface: true }} />
    </div>
    <MenuSurface bind:this={surface} anchorCorner="BOTTOM_LEFT" class="select-cmaps-menu">
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
        {#each Object.keys(allColorMaps[selectedColorMapType]) as aColorMap}
          <div
            title={aColorMap}
            style="cursor:pointer; margin-top:5px; height: 20px; width: 100%; background: linear-gradient(90deg, {allColorMaps[
              selectedColorMapType
            ][aColorMap].colors(defaultNumberOfColors, 'rgba')})"
            use:Ripple={{ surface: true }}
            on:click={() => {
              activeColorMapName = aColorMap
              activeColorMap = allColorMaps[selectedColorMapType][aColorMap]
              reclassifyImage
            }} />
        {/each}
      </div>
    </MenuSurface>
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
        width: 100%;
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
        align-items: center;
        justify-content: space-around;
      }
    }

    .cmap-selection {
      display: block;

      .colormap-div {
        height: 100%;
        width: 20px;
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
    margin-right: 0;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }

  * :global(.colormap-chips) {
    justify-content: space-evenly;
    display: flex;
  }

  * :global(#intervals-cmap-button) {
    margin-bottom: 2rem;
    width: 100%;
    height: 100%;
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
  * :global(.color-picker-handle) {
    border-radius: 0 !important;
    height: 20px !important;
    width: 20px !important;
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

  #class-and-method-control-div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  #intervals-cmap-div {
    display: flex;
    justify-content: space-between;
    width: 100%;
    border: 2px solid black;
  }
  :global(.select-cmaps-menu) {
    max-height: 200px;
    overflow-y: scroll;
    width: 100%;
    margin-top: 5px;
    padding: 5px;
  }
</style>
