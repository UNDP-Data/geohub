<script context="module">
  const lState = {}
</script>

<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import Button, { Label as LabelButton } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'

  import { sequentialColormaps, divergingColorMaps, cyclicColorMaps } from '../lib/colormaps'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import { map, layerList } from '../stores/index'
  import chroma from 'chroma-js'

  export let lMin
  export let lMax
  export let scalingValueStart
  export let scalingValueEnd
  export let colorMapName
  export let layerConfig: Layer = LayerInitialValues
  let disabled = true
  let rangeSliderValues = [scalingValueStart, scalingValueEnd]
  $: {
    scalingValueStart = rangeSliderValues[0]
    scalingValueEnd = rangeSliderValues[1]
  }

  let name: string, definition: LayerDefinition
  ;({ name, definition } = layerConfig)
  const layerId = definition.id

  const iconButtonStyle = 'font-size: 18px; width: 24px; height: 24px;'
  let selectedColorMapType = ''
  let sliderMin = Math.floor(lMin)
  let sliderMax = Math.ceil(lMax)
  const colorMapTypes: Array<string> = ['sequential', 'diverging', 'cyclic']
  const cMapMap = { sequential: sequentialColormaps, diverging: divergingColorMaps, cyclic: cyclicColorMaps }

  let cmapSelectionShown = false
  let changeLegend = false
  let mapLayers = $map.getStyle().layers
  let scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  let isLegendUniqueValues: boolean
  let isLegendInterval: boolean
  let step = 0.1

  const remap = (input, oldMin, oldMax, newMin = 0, newMax = 255) => {
    const percent = (input - oldMin) / (oldMax - oldMin)
    const output = percent * (newMax - newMin) + newMin
    return Math.round(output)
  }

  let layer = $layerList.filter((item) => item.definition.id === layerId).pop()

  const layerBandMetadataUniqueV = layer.info['band_metadata'][0][1]['STATISTICS_UNIQUE_VALUES']
  const layerSrc = $map.getSource(layer.definition.source)

  const lURL = new URL(layerSrc.tiles[0])
  colorMapName = lURL.searchParams.get('colormap_name')
  let cmapListRBG
  let uniqueValueLegendExists = false
  let cmapList = []
  let bgList = {}

  $: selectedColorMapType, generateCmapBackground()
  $: colorMapName, updateParamsInURL({ colormap_name: colorMapName })
  $: cmapList, getCmapBackground()
  $: {
    scalingValueStart = rangeSliderValues[0]
    scalingValueEnd = rangeSliderValues[1]
  }

  const setUniqueValueLegend = () => {
    let layerSrc = mapLayers.filter((item) => item.id === layerId).pop()['source']
    const layerSource = $map.getSource(layerSrc)
    let cmapObject = {}
    let cMapName
    if (layerSource.tiles) {
      const oldUrl = new URL(layerSource.tiles[0])

      if (uniqueValueLegendExists) {
        cMapName = oldUrl.searchParams.get('colormap')
      } else {
        cMapName = oldUrl.searchParams.get('colormap_name')
        oldUrl.searchParams.delete('colormap_name')
      }
      cmapListRBG = chroma.scale(colorMapName).domain([0, 255]).colors(layerBandMetadataUniqueV.length, 'rgba')
      layerBandMetadataUniqueV.forEach(
        (key, i) =>
          (cmapObject[
            remap(key, layerBandMetadataUniqueV[0], layerBandMetadataUniqueV[layerBandMetadataUniqueV.length - 1])
          ] = cmapListRBG[i].rgb()),
      )

      uniqueValueLegendExists = true

      let encodedCmap = JSON.stringify(cmapObject)

      oldUrl.searchParams.set('colormap', encodedCmap)
      oldUrl.searchParams.set(
        'rescale',
        encodeURIComponent(
          String(`${layerBandMetadataUniqueV[0]},${layerBandMetadataUniqueV[layerBandMetadataUniqueV.length - 1]}`),
        ),
      )

      $map.getSource(layerSrc).tiles = [decodeURI(oldUrl.toString())]
      $map.style.sourceCaches[layerSrc].clearTiles()
      $map.style.sourceCaches[layerSrc].update($map.transform)
      $map.triggerRepaint()
    }
  }

  const generateCmapBackground = () => {
    if (selectedColorMapType) {
      console.log(colorMapName, selectedColorMapType)
      const cmaps = cMapMap[selectedColorMapType]
      console.log(cmaps)
      cmaps.forEach((cmapstr: string) => {
        const cmap = chroma.scale(cmapstr).padding([0.25, 0]).domain([0, 255]).colors(9, 'hex')

        //console.log(cmapstr, cmap, typeof cmap)
        bgList[cmapstr] = cmap
      })
    }
  }

  const getCmapBackground = () => {
    cmapList = chroma.scale(colorMapName).padding([0.25, 0]).domain([0, 255]).colors(9, 'hex')
    console.log(colorMapName, cmapList)
  }

  const updateParamsInURL = (params) => {
    let layers = mapLayers.filter((item) => item.id === layerId).pop()['source']
    const layerSource = $map.getSource(layers)

    if (layerSource.tiles) {
      const oldUrl = new URL(layerSource.tiles[0])
      Object.keys(params).forEach((key) => {
        oldUrl.searchParams.set(key, params[key])
      })
      $map.getSource(layers).tiles = [decodeURI(oldUrl.toString())]
      $map.style.sourceCaches[layers].clearTiles()
      $map.style.sourceCaches[layers].update($map.transform)
      $map.triggerRepaint()
    }
  }
</script>

<div class="group">
  <div class="slider">
    <RangeSlider
      bind:values={rangeSliderValues}
      float
      range
      min={sliderMin}
      max={sliderMax}
      {step}
      pips
      first="label"
      last="label"
      rest={false} />
  </div>

  {#if !uniqueValueLegendExists}
    <div style="display:flex;flex-direction:column; align-items:center">
      <div
        on:click={() => {
          cmapSelectionShown = !cmapSelectionShown
          getCmapBackground()
        }}
        class="chroma-test"
        style="background: linear-gradient(90deg, {cmapList})" />
      <div style="align-items: center; justify-content: space-between" class="chroma-test">
        <div style="display: flex; flex-direction: row; justify-content: space-between">
          <div>
            {scalingValueStart}
          </div>
          <div>
            {scalingValueEnd}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div
      on:click={() => {
        cmapSelectionShown = !cmapSelectionShown
      }}
      style="display: flex; align-items: center; justify-content: space-around; flex-direction: column">
      <div style="display: block">
        {#each cmapList as value, index}
          <div style="display: flex; padding:2px;">
            <div class="discrete" style="background-color: {value}" />
            &nbsp-&nbsp
            <div>{layerBandMetadataUniqueV[index]}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class={cmapSelectionShown ? 'cmap-selection shown' : 'cmap-selection hidden'}>
    <Set class="colormap-chips" chips={colorMapTypes} let:chip choice bind:selected={selectedColorMapType}>
      <Chip {chip}>
        <Text>{chip}</Text>
      </Chip>
    </Set>
    <div>
      {#if selectedColorMapType === 'sequential'}
        <div class="colormaps-group">
          {#each sequentialColormaps as seqColorMap}
            <div
              class="colormap-div"
              title={seqColorMap}
              on:click={() => {
                colorMapName = seqColorMap
                // console.log(colorMapName, Object.keys(bgList))
                cmapList = bgList[seqColorMap]
              }}
              style="background: linear-gradient(90deg, {bgList[seqColorMap]})" />
          {/each}
        </div>
      {:else if selectedColorMapType === 'diverging'}
        <div class="colormaps-group">
          {#each divergingColorMaps as divColorMap}
            <div
              class="colormap-div"
              title={divColorMap}
              on:click={() => {
                colorMapName = divColorMap
                cmapList = bgList[divColorMap]
              }}
              style="background: linear-gradient(90deg, {bgList[divColorMap]})" />
          {/each}
        </div>
      {:else if selectedColorMapType === 'cyclic'}
        <div class="colormaps-group">
          {#each cyclicColorMaps as cycColorMap}
            <div
              title={cycColorMap}
              class="colormap-div"
              on:click={() => {
                colorMapName = cycColorMap
                cmapList = bgList[cycColorMap]
              }}
              style="background: linear-gradient(90deg, {bgList[cycColorMap]})" />
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <div class="changeLegendButtonDiv">
    <Button class="changelegendbtn" variant="raised">
      <LabelButton>Reclassify</LabelButton>
    </Button>
  </div>
  {#if layerBandMetadataUniqueV.length}
    <div class="changeLegendButtonDiv">
      <Button on:click={setUniqueValueLegend} class="changelegendbtn" variant="raised">
        <LabelButton>Unique values</LabelButton>
      </Button>
    </div>
  {/if}
</div>

<style lang="scss">
  .colormap-div {
    height: 20px;
    width: 80%;
    cursor: pointer;
    justify-content: center;
    margin: 1px;
    // transform: rotate(90deg) ;
  }
  .group {
    background: #f0f0f0;
    border-radius: 7.5px;
    padding: 2px;
    margin-top: 1px;
    padding-bottom: 4px;

    .slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
      width: 80%;
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
  #discrete-cmap {
    height: 20px;
    width: 100%;
  }
</style>
