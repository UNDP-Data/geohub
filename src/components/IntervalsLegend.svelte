<script lang="ts">
  import chroma from 'chroma-js'
  import Button, { Label as LabelButton } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'
  import Ripple from '@smui/ripple'
  import Fa from 'svelte-fa'
  import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft'
  import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight'
  import type {
    RasterLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'

  import { map } from '../stores/index'
  import { ColorMaps } from '../lib/colormaps'
  import type { Layer, LayerInfo } from '../lib/types'
  import { ClassificationMethodTypes, ColorMapTypes, LayerInitialValues } from '../lib/constants'
  import { updateParamsInURL } from '../lib/helper'

  export let layerConfig: Layer = LayerInitialValues
  export let activeColorMapName = ''
  let definition: RasterLayerSpecification | FillLayerSpecification | LineLayerSpecification | SymbolLayerSpecification
  let info: LayerInfo
  ;({ definition, info } = layerConfig)

  const layerMin = Number(info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  const layerMax = Number(info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  let rangeSliderValues = [layerMin, layerMax]

  const defaultNumberOfColors = 5

  let activeColorMap: chroma.Scale = undefined
  let allColorMaps = {}
  let classificationMethods = [
    { name: 'Equidistant', value: 'e' },
    { name: 'Quantile', value: 'q' },
    { name: 'Logarithmic', value: 'l' },
  ]

  let colorMapSelectionVisible = false
  let intervalList = []
  let numberOfClasses = 5
  let selectedColorMapType = ''
  let selectedClassificationMethod = ClassificationMethodTypes.EQUIDISTANT

  //populate allColorMaps with scale/colors
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

  const reclassifyImage = (params = {}) => {
    const layerSrc = $map.getSource(definition.source)
    const layerURL = new URL(layerSrc.tiles[0])
    let cmap = []

    intervalList = chroma.limits(rangeSliderValues, selectedClassificationMethod, numberOfClasses).map((element) => {
      return Number(element.toFixed(2))
    })

    let scaleColorList = chroma.scale(activeColorMapName).classes(intervalList)
    for (let i = 0; i <= numberOfClasses - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      let c = [...scaleColorList(intervalList[i]).rgb(), 255]
      let intervalStart = intervalList[i]
      let intervalEnd = intervalList[i + 1]
      let cmapitem = [[intervalStart, intervalEnd], c]
      cmap.push(cmapitem)
    }
    let encodedCmap = JSON.stringify(cmap)
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    let updatedParams = Object.assign({ colormap: encodedCmap }, params)
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

  const getActiveColorMap = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    return [...activeColorMap.colors()]
  }

  setTimeout(() => {
    reclassifyImage()
  }, 3000)
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
            reclassifyImage()
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
        style="background:linear-gradient(90deg, {getActiveColorMap()})">
        <LabelButton style="text-transform: lowercase">{activeColorMapName}</LabelButton>
      </Button>
    </div>
    <div class="column" id="intervals-list-div">
      {#each activeColorMap.colors(numberOfClasses, 'rgba') as value, index}
        <div style="display: flex; padding:2px; width: 50%; margin: auto">
          <div class="discrete" style="background-color: {value}" />
          &nbsp;&raquo;&nbsp
          <div>{intervalList[index]} - {intervalList[index + 1]}</div>
        </div>
      {/each}
    </div>
  </div>

  <div class={colorMapSelectionVisible ? 'cmap-selection shown' : 'cmap-selection hidden'}>
    <Set class="colormap-chips" chips={Object.keys(ColorMaps)} let:chip choice bind:selected={selectedColorMapType}>
      <Chip {chip}>
        <Text>{chip}</Text>
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

              reclassifyImage()
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
    background: #f0f0f0;
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
</style>
