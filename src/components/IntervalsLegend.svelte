<script lang="ts" context="module">
  const activeColorMapNameState = {}
  const cmapState = {}
  const numberOfClassesState = {}
  const selectedClassificationMethodState = {}
</script>

<script lang="ts">
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'
  import Ripple from '@smui/ripple'
  import type {
    FillLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import Fa from 'svelte-fa'
  import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft'
  import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight'

  import RasterColorPicker from '$components/raster/RasterColorPicker.svelte'
  import { ClassificationMethodTypes, LayerInitialValues } from '$lib/constants'
  import { updateParamsInURL } from '$lib/helper'
  import type { Layer, LayerInfo, Color } from '$lib/types'
  import { map } from '$stores'

  export let activeColorMapName: string
  export let layerConfig: Layer = LayerInitialValues
  export let numberOfClasses = numberOfClassesState[layerConfig.definition.id] || 5

  let definition:
    | RasterLayerSpecification
    | FillLayerSpecification
    | LineLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info: LayerInfo
  ;({ definition, info } = layerConfig)

  const layerMin = Number(info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  const layerMax = Number(info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let activeColorMap: chroma.Scale
  let cmap = cmapState[layerConfig.definition.id]
  let cmapColorsList = []
  let color
  let currentIntervalColor
  let intervalIndex: number
  let intervalList = []
  let rangeSliderValues = [layerMin, layerMax]
  let selectedClassificationMethod =
    selectedClassificationMethodState[layerConfig.definition.id] || ClassificationMethodTypes.EQUIDISTANT
  let showToolTip = false

  let classificationMethods = [
    { name: 'Equidistant', value: 'e' },
    { name: 'Quantile', value: 'q' },
  ]
  if (layerMin > 0) {
    classificationMethods.push({ name: 'Logarithmic', value: 'l' })
  }

  $: selectedClassificationMethod, setClassificationMethodState()
  $: numberOfClasses, setNumberOfClassesState()
  $: activeColorMapName, setActiveColorMapNameState()
  $: {
    if (intervalIndex !== undefined) {
      setIndexColor(intervalIndex)
    }
  }
  $: color, updateColorMap(intervalIndex, color)

  // Generic function to store the colormap
  const setCmapState = (cmap) => {
    cmapState[layerConfig.definition.id] = cmap
  }

  // Fixme: This function is being called twice every time
  // Reclassify the layer every time the color, interval or number of classes is changed.
  // Fixme: Need to rewrite the function to detect the exact operation that has been carried out

  const reclassifyImage = () => {
    intervalList = chroma.limits(rangeSliderValues, selectedClassificationMethod, numberOfClasses).map((element) => {
      return Number(element.toFixed(2))
    })

    let scaleColorList = chroma.scale(activeColorMapName).classes(intervalList)
    if (cmapState[layerConfig.definition.id] !== undefined) {
      cmap = cmapState[layerConfig.definition.id]
      if (cmap.length > 0) {
        cmap = []
        cmapColorsList = []
        setCmapState(cmap)
      }
      for (let i = 0; i <= numberOfClasses - 1; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        let c = [...scaleColorList(intervalList[i]).rgb(), 255]
        let intervalStart = intervalList[i]
        let intervalEnd = intervalList[i + 1]
        let cmapitem = [[intervalStart, intervalEnd], c]
        cmap.push(cmapitem)
        cmapColorsList.push(cmapitem[1])
      }
      setCmapState(cmap)
      handleParamsUpdate(cmap)
    } else {
      // cmap is undefined. Initially
      cmap = []
      for (let i = 0; i <= numberOfClasses - 1; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        let c = [...scaleColorList(intervalList[i]).rgb(), 255]
        let intervalStart = intervalList[i]
        let intervalEnd = intervalList[i + 1]
        let cmapitem = [[intervalStart, intervalEnd], c]
        cmap.push(cmapitem)
        cmapColorsList.push(cmapitem[1])
      }
      setCmapState(cmap)
      handleParamsUpdate(cmap)
    }
  }

  // Function to encode colormap, and update url parameters
  const handleParamsUpdate = (cmap: object) => {
    let encodedCmap = JSON.stringify(cmap)
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    let updatedParams = Object.assign({ colormap: encodedCmap })
    updateParamsInURL(definition, layerURL, updatedParams)
  }

  // The opacity of the titiler is between 0 and 255 instead of 0-1.
  // This function rescales the opacity to 0-255
  function rescaleOpacity(opacity: number) {
    return 255 * opacity
  }

  const setClassificationMethodState = () => {
    selectedClassificationMethodState[layerConfig.definition.id] = selectedClassificationMethod
    reclassifyImage()
  }

  const setNumberOfClassesState = () => {
    numberOfClassesState[layerConfig.definition.id] = numberOfClasses
  }

  const setActiveColorMapNameState = () => {
    activeColorMapNameState[layerConfig.definition.id] = activeColorMapName
    reclassifyImage()
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

  const setIndexColor = (index) => {
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
  }

  const updateColorMap = (index: number, color: Color) => {
    // eslint-disable-next-line no-empty
    if (index === undefined || color === undefined) {
    } else {
      cmap[index].splice(1, 1, chroma(color['hex']).rgba())
      cmap[index][1].splice(3, 1, rescaleOpacity(cmap[index][1][3]))
      handleParamsUpdate(cmap)
      setCmapState(cmap)
      document.getElementById(`interval-${index}`).style.background = `rgb(${chroma(color['hex']).rgba()})`
    }
  }

  const sendLastInterval = (index: number, item: string) => {
    if (item < cmap[index + 1][0][1]) {
      cmap[index][0].splice(1, 1, Number(item))
      cmap[index + 1][0].splice(0, 1, Number(item))
      handleParamsUpdate(cmap)
      setCmapState(cmap)
    } else {
      console.warn(
        'That is not allowed!! Please make sure your intervals follow the right order to see your changes on the map',
      )
    }
  }
</script>

<div class="column" data-testid="intervals-view-container">
  <div class="row" style="display: flex;">
    <div style="width: 50%; margin-left: 5%">
      <span class="legend-text">Classification: </span>
    </div>
    <div style="width: 50%; margin-left: 40%">
      <span class="legend-text">Classes</span>
    </div>
  </div>
  <div class="row" id="class-and-method-control-div">
    <div class="column" style="padding: 0; width: 80%!important;">
      <select
        id="method"
        bind:value={selectedClassificationMethod}
        on:change={() => {
          reclassifyImage
        }}>
        <option class="legend-text" value="" disabled selected>Classification</option>
        {#each classificationMethods as classificationMethod}
          <option class="legend-text" value={classificationMethod.value}>{classificationMethod.name}</option>
        {/each}
      </select>
    </div>
    <div class="column" style="padding: 0; width: 20%!important;">
      <div class="no-classes" style="display: flex; justify-content: flex-end;">
        <div
          class="icon-selected"
          title="Decrease number of classes"
          on:click={() => {
            handleNumberOfClasses('decrement')
          }}>
          <Fa icon={faCaretLeft} size="2x" style="transform: scale(1); cursor: pointer" />
        </div>
        <input type="text" bind:value={numberOfClasses} size="1" style="text-align:center; border:none" />
        <div
          class="icon-selected"
          title="Increase number of classes"
          on:click={() => {
            handleNumberOfClasses('increment')
          }}>
          <Fa icon={faCaretRight} size="2x" style="transform: scale(1); cursor: pointer" />
        </div>
      </div>
    </div>
  </div>
  <div class="row" id="intervals-cmap-div">
    <div class="column" style="padding: 0; width: 90%">
      {#each cmap as value, index}
        <div style="display: flex; padding:2px; width: 100%;">
          <div
            use:Ripple={{ surface: true }}
            id="interval-{index}"
            on:click={() => {
              showToolTip = !showToolTip
              intervalIndex = index
            }}
            class="discrete"
            style="width:20px; height:20px; caret-color:rgb({cmap[
              index
            ][1]}); cursor:pointer; background-color: rgb({cmap[index][1]})" />
          {#if showToolTip}
            <div class={showToolTip && intervalIndex === index ? 'tooltipshown' : 'tooltiphidden'} transition:fade>
              <RasterColorPicker bind:color />
            </div>
          {/if}
          &nbsp;&raquo;&nbsp
          <span
            class="legend-text"
            contenteditable="true"
            bind:innerHTML={intervalList[index]}
            on:input={sendLastInterval(index, intervalList[index])} />

          <span class="legend-text"> &nbsp;&horbar;&nbsp; </span>
          <span
            class="legend-text"
            contenteditable="true"
            bind:innerHTML={intervalList[index + 1]}
            on:input={sendLastInterval(index, intervalList[index + 1])} />
        </div>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  #class-and-method-control-div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100% !important;
  }

  #intervals-cmap-div {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  :global(.select-cmaps-menu) {
    max-height: 200px;
    overflow-y: scroll;
    width: 100%;
    margin-top: 5px;
    padding: 5px;
  }

  :global(.legend-text) {
    font-family: ProximaNova, sans-serif;
    max-width: 30%;
    width: 30%;
  }

  :global(.show) {
    display: none;
  }

  :global(.tooltiphidden) {
    display: none !important;
  }
</style>
