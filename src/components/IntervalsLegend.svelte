<script lang="ts">
  import chroma from 'chroma-js'
  import Chip, { Set, Text } from '@smui/chips'
  import Button, { Label as LabelButton } from '@smui/button'
  import Fa from 'svelte-fa'
  import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft'
  import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight'
  import { map } from '../stores/index'
  import { ColorMaps } from '../lib/colormaps'
  import type { Layer, LayerInfo } from '../lib/types'
  import type {
    RasterLayerSpecification,
    FillLayerSpecification,
    LineLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { ClassificationMethodTypes, ColorMapTypes, LayerInitialValues } from '../lib/constants'
  import Ripple from '@smui/ripple'

  export let layerConfig: Layer = LayerInitialValues
  export let activeColorMapName = ''
  let definition: RasterLayerSpecification | FillLayerSpecification | LineLayerSpecification | SymbolLayerSpecification
  let info: LayerInfo
  ;({ definition, info } = layerConfig)

  const layerMin = Number(info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  const layerMax = Number(info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  let rangeSliderValues = [layerMin, layerMax]

  const defaultNumberOfColors = 5
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let activeColorMap: chroma.Scale = undefined
  let allColorMaps = {}
  let colorMapSelectionVisible = false
  let selectedColorMapType = ''

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

  let intervalList = []
  let numberOfClasses = 5
  let classificationMethods = [
    { name: 'Equidistant', value: 'e' },
    { name: 'Quantile', value: 'q' },
    { name: 'Logarithmic', value: 'l' },
  ]

  let selectedClassificationMethod = ClassificationMethodTypes.EQUIDISTANT

  const reclassifyImage = (params = {}) => {
    let cmap = []

    intervalList = chroma.limits(rangeSliderValues, selectedClassificationMethod, numberOfClasses).map((element) => {
      return Number(element.toFixed(2))
    })

    let scaleColorList = chroma.scale(activeColorMapName).classes(intervalList)
    for (let i = 0; i <= numberOfClasses - 1; i++) {
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
    updateParamsInURL(updatedParams)
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

  reclassifyImage()
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

  <div class="row">
    <div style="width: 50%; height: 20px">
      Active colormap:
      <Button
        on:click={() => {
          colorMapSelectionVisible = !colorMapSelectionVisible
        }}
        variant="raised"
        style="width:100%; height:100%;background:linear-gradient(90deg, {[...activeColorMap.colors()]})">
        <LabelButton style="text-transform: lowercase">{activeColorMapName}</LabelButton>
      </Button>
    </div>
    <div class="column">
      Intervals:
      {#each activeColorMap.colors(numberOfClasses, 'rgba') as value, index}
        <div style="display: flex; padding:2px;">
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
  .no-classes {
    display: flex;
    flex-direction: row;
  }
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
    display: block;
    flex-direction: column;
    flex-basis: 100%;
    align-items: center;
    flex: 1;
    border: 0px solid red;
  }
  .intervals-legend {
    display: flex;
    flex-direction: column;
    align-items: stretch;

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
    margin-top: 1px;
    padding-bottom: 4px;

    @media (prefers-color-scheme: dark) {
      background: #323234;
      color: white;
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
    display: block;
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
