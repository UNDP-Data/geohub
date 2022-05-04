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
  import { faCircleMinus } from '@fortawesome/free-solid-svg-icons/faCircleMinus'
  import { faCirclePlus } from '@fortawesome/free-solid-svg-icons/faCirclePlus'
  import { debounce } from 'lodash-es'

  import RasterColorPicker from '$components/raster/RasterColorPicker.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    LayerInitialValues,
    COLOR_CLASS_COUNT_MINIMUM,
    COLOR_CLASS_COUNT_MAXIMUM,
  } from '$lib/constants'
  import { updateParamsInURL } from '$lib/helper'
  import type { Layer, LayerInfo, Color } from '$lib/types'
  import { map } from '$stores'

  // export let activeColorMapName: string
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
  let activeColorMapName = layerConfig.colorMapName

  const layerMin = Number(info.band_metadata[0][1]['STATISTICS_MINIMUM'])
  const layerMax = Number(info.band_metadata[0][1]['STATISTICS_MAXIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let cmap = cmapState[layerConfig.definition.id]
  let cmapColorsList = []
  let color = {
    r: null,
    g: null,
    b: null,
    hex: null,
    h: null,
    s: null,
    v: null,
  }
  let currentIntervalColor = {}
  let intervalIndex: number
  let intervalList = []
  let rangeSliderValues = [layerMin, layerMax]
  let selectedClassificationMethod =
    selectedClassificationMethodState[layerConfig.definition.id] || ClassificationMethodTypes.EQUIDISTANT
  let showToolTip = false

  const classificationMethods = [
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
    { name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC },
  ]

  $: {
    if (layerConfig) {
      activeColorMapName = layerConfig.colorMapName
      setActiveColorMapNameState()
    }
  }

  $: color, updateColorMap(intervalIndex, color)
  $: numberOfClasses, setNumberOfClassesState()
  $: selectedClassificationMethod, setClassificationMethodState()
  $: {
    if (intervalIndex !== undefined) {
      setIndexColor(intervalIndex)
    }
  }

  // Generic function to store the colormap
  const setCmapState = (cmap) => {
    cmapState[layerConfig.definition.id] = cmap
  }

  // Fixme: This function is being called twice every time
  // Reclassify the layer every time the color, interval or number of classes is changed.
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
  const handleParamsUpdate = debounce((cmap: object) => {
    let encodedCmap = JSON.stringify(cmap)
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    let updatedParams = Object.assign({ colormap: encodedCmap })
    updateParamsInURL(definition, layerURL, updatedParams)
  }, 500)

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

  const handleIncrementDecrementClasses = (operation: string) => {
    if (operation === '+') {
      if (numberOfClasses < COLOR_CLASS_COUNT_MAXIMUM) {
        numberOfClasses++
      }
    }
    if (operation === '-') {
      if (numberOfClasses > COLOR_CLASS_COUNT_MINIMUM) {
        numberOfClasses--
      }
    }
    reclassifyImage()
  }

  const setIndexColor = (index: number) => {
    currentIntervalColor = cmap[index][1]

    let r = currentIntervalColor[0]
    let g = currentIntervalColor[1]
    let b = currentIntervalColor[2]

    color = {
      r,
      g,
      b,
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
      try {
        cmap[index].splice(1, 1, chroma(color['hex']).rgba())
        cmap[index][1].splice(3, 1, rescaleOpacity(cmap[index][1][3]))
        handleParamsUpdate(cmap)
        setCmapState(cmap)
        document.getElementById(`interval-${index}`).style.background = `rgb(${chroma(color['hex']).rgba()})`
      } catch (e) {
        console.log(e)
      }
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

<div class="intervals-view-container" data-testid="intervals-view-container">
  <div class="columns is-gapless controls">
    <div class="column classification">
      <div class="is-size-6 is-flex is-justify-content-center" style="margin-bottom: 5px;">Classification</div>
      <div class="select is-rounded is-flex is-justify-content-center" style="height: 30px;">
        <select bind:value={selectedClassificationMethod} on:change={() => reclassifyImage()} style="width: 114px;">
          {#each classificationMethods as classificationMethod}
            <option class="legend-text" value={classificationMethod.code}>{classificationMethod.name}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="column number-classes">
      <div class="is-size-6 is-flex is-justify-content-center">Number of Classess</div>
      <div class="container is-flex is-justify-content-center">
        <div class="row">
          <div
            class={`minus ${numberOfClasses === COLOR_CLASS_COUNT_MINIMUM ? 'disabled' : ''}`}
            on:click={() => handleIncrementDecrementClasses('-')}
            alt="Decrease number of classes"
            title="Decrease number of classes">
            <Fa icon={faCircleMinus} />
          </div>
          <div class="tag is-info is-light is-medium">
            {numberOfClasses}
          </div>
          <div
            class={`plus ${numberOfClasses === COLOR_CLASS_COUNT_MAXIMUM ? 'disabled' : ''}`}
            on:click={() => handleIncrementDecrementClasses('+')}
            alt="Increase number of classes"
            title="Increase number of classes">
            <Fa icon={faCirclePlus} />
          </div>
        </div>
      </div>
    </div>
  </div>

  {#each cmap as value, index}
    <div class="columns is-vcentered is-gapless colormap-editor">
      <div class="column is-1 color-picker">
        <div
          use:Ripple={{ surface: true }}
          id="interval-{index}"
          on:click={() => {
            showToolTip = !showToolTip
            intervalIndex = index
          }}
          class="discrete"
          style="caret-color:rgb({cmap[index][1]}); background-color: rgb({cmap[index][1]})" />

        {#if showToolTip}
          <div class={`tooltip ${showToolTip && intervalIndex === index ? '' : 'tooltip-hidden'}`} transition:fade>
            <RasterColorPicker bind:color />
          </div>
        {/if}
      </div>

      <div class="column minimum">
        <input
          class="input is-small"
          type="number"
          min="-1000000"
          max="1000000"
          value={intervalList[index]}
          on:input={() => sendLastInterval(index, intervalList[index])} />
      </div>

      <div class="column maximum">
        <input
          class="input is-small"
          type="number"
          min="-1000000"
          max="1000000"
          value={intervalList[index + 1]}
          on:input={() => sendLastInterval(index, intervalList[index + 1])} />
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .intervals-view-container {
    .controls {
      margin-bottom: 10px !important;

      .number-classes {
        .container {
          height: 40px;
          display: flex;
          justify-content: center;

          .row {
            display: flex;
            align-items: center;

            .minus,
            .plus {
              cursor: pointer;
            }

            .disabled {
              opacity: 0.1;
              cursor: default;
            }

            .tag {
              margin-left: 10px;
              margin-right: 10px;
              user-select: none;
              -moz-user-select: none;
              -webkit-user-select: none;
              -ms-user-select: none;
            }
          }
        }
      }
    }

    $input-margin: 5px !important;

    .colormap-editor {
      margin-bottom: $input-margin;

      .color-picker {
        margin-right: $input-margin;
      }

      .minimum {
        margin-right: $input-margin;
      }

      .discrete {
        width: 20px;
        height: 20px;
        cursor: pointer;
      }

      .tooltip-hidden {
        display: none !important;
      }

      .tooltip {
        position: relative;
        left: 19px;
        top: -20px;
        z-index: 10;
      }
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type='number'] {
      -moz-appearance: textfield;
    }
  }
</style>
