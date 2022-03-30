<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'
  import RangeSlider from 'svelte-range-slider-pips'

  import { sequentialColormaps, divergingColorMaps, qualitativeColorMaps } from '../lib/colormaps'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues, ColorMapTypes } from '../lib/constants'
  import { map, layerList } from '../stores/index'
  import chroma from 'chroma-js'

  export let lMin = 0
  export let lMax = 0
  export let scalingValueStart = 0
  export let scalingValueEnd = 0
  export let layerConfig: Layer = LayerInitialValues

  let rangeSliderValues = [scalingValueStart, scalingValueEnd]
  let definition: LayerDefinition
  ;({ definition } = layerConfig)
  let colorMapName = ''
  let colorMapList = []
  let colorMapListRGB = []
  let colorMapSelectionVisible = false
  let colorBackgroundList = []
  let layerId = definition.id
  let layer = $layerList.find((item) => item.definition.id === layerId)
  let mapLayers = $map.getStyle().layers
  let selectedColorMapType = ''
  let sliderMin = lMin
  let sliderMax = lMax
  let step = 1e-1
  let uniqueValueLegendExists = false

  const colorMapMap = {
    sequential: sequentialColormaps,
    diverging: divergingColorMaps,
    qualitative: qualitativeColorMaps,
  }
  const layerBandMetadataUniqueV = layer.info['band_metadata'][0][1]['STATISTICS_UNIQUE_VALUES']
  const layerSrc = $map.getSource(layer.definition.source)
  const layerUrl = new URL(layerSrc.tiles[0])

  $: {
    scalingValueStart = rangeSliderValues[0]
    scalingValueEnd = rangeSliderValues[1]
  }

  colorMapName = layerUrl.searchParams.get('colormap_name')

  $: selectedColorMapType, generateCmapBackground()
  $: colorMapName, updateParamsInURL({ colormap_name: colorMapName })
  $: colorMapList, getCmapBackground()
  $: {
    scalingValueStart = rangeSliderValues[0]
    scalingValueEnd = rangeSliderValues[1]
  }

  const remap = (input = 0, oldMin = 0, oldMax = 0, newMin = 0, newMax = 255) => {
    const percent = (input - oldMin) / (oldMax - oldMin)
    const output = percent * (newMax - newMin) + newMin
    return Math.round(output)
  }

  const setUniqueValueLegend = () => {
    let layerSrc = mapLayers.find((item) => item.id === layerId)['source']
    const layerSource = $map.getSource(layerSrc)
    let cmapObject = {}
    let colorMapName = ''
    if (layerSource.tiles) {
      const oldUrl = new URL(layerSource.tiles[0])

      if (uniqueValueLegendExists) {
        colorMapName = oldUrl.searchParams.get('colormap')
      } else {
        colorMapName = oldUrl.searchParams.get('colormap_name')
        oldUrl.searchParams.delete('colormap_name')
      }
      colorMapListRGB = chroma.scale(colorMapName).domain([0, 255]).colors(layerBandMetadataUniqueV.length, 'rgba')
      layerBandMetadataUniqueV.forEach(
        (key, i) =>
          (cmapObject[
            remap(key, layerBandMetadataUniqueV[0], layerBandMetadataUniqueV[layerBandMetadataUniqueV.length - 1])
          ] = colorMapListRGB[i].rgb()),
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
      const cmaps = colorMapMap[selectedColorMapType]
      cmaps.forEach((cmapstr: string) => {
        try {
          if (selectedColorMapType === ColorMapTypes.SEQUENTIAL) {
            colorBackgroundList[cmapstr] = chroma
              .scale(cmapstr)
              .mode('lrgb')
              .padding([0.25, 0])
              .domain([lMin, lMax])
              .colors(5, 'rgba')
          } else {
            colorBackgroundList[cmapstr] = chroma.scale(cmapstr).mode('hsv').domain([lMin, lMax]).colors(5, 'rgba')
          }
        } catch (error) {
          console.log(`failed to process ${cmapstr} because ${error}`)
        }
      })
    }
  }

  const getCmapBackground = () => {
    colorMapList = chroma.scale(colorMapName).mode('lrgb').padding([0.25, 0]).domain([lMin, lMax]).colors(5, 'rgba')
  }

  const updateParamsInURL = (params) => {
    let layers = mapLayers.find((item) => item.id === layerId)['source']
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
        title={colorMapName}
        on:click={() => {
          colorMapSelectionVisible = !colorMapSelectionVisible
          getCmapBackground()
        }}
        class="chroma-test"
        style="background: linear-gradient(90deg, {colorMapList}); cursor: pointer;" />
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
        colorMapSelectionVisible = !colorMapSelectionVisible
      }}
      style="display: flex; align-items: center; justify-content: space-around; flex-direction: column">
      <div style="display: block">
        {#each colorMapList as value, index}
          <div style="display: flex; padding:2px;">
            <div class="discrete" style="background-color: {value}" />
            &nbsp-&nbsp
            <div>{layerBandMetadataUniqueV[index]}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class={colorMapSelectionVisible ? 'cmap-selection shown' : 'cmap-selection hidden'}>
    <Set
      class="colormap-chips"
      chips={Object.values(ColorMapTypes)}
      let:chip
      choice
      bind:selected={selectedColorMapType}>
      <Chip {chip}>
        <Text>{chip}</Text>
      </Chip>
    </Set>
    <div>
      {#if selectedColorMapType === ColorMapTypes.SEQUENTIAL}
        <div class="colormaps-group">
          {#each sequentialColormaps as seqColorMap}
            <div
              class="colormap-div"
              title={seqColorMap}
              on:click={() => {
                colorMapName = seqColorMap
                colorMapList = colorBackgroundList[seqColorMap]
              }}
              style="background: linear-gradient(90deg, {colorBackgroundList[seqColorMap]})" />
          {/each}
        </div>
      {:else if selectedColorMapType === ColorMapTypes.DIVERGING}
        <div class="colormaps-group">
          {#each divergingColorMaps as divColorMap}
            <div
              class="colormap-div"
              title={divColorMap}
              on:click={() => {
                colorMapName = divColorMap
                colorMapList = colorBackgroundList[divColorMap]
              }}
              style="background: linear-gradient(90deg, {colorBackgroundList[divColorMap]})" />
          {/each}
        </div>
      {:else if selectedColorMapType === ColorMapTypes.QUALITATIVE}
        <div class="colormaps-group">
          {#each qualitativeColorMaps as qualitColorMap}
            <div
              title={qualitColorMap}
              class="colormap-div"
              on:click={() => {
                colorMapName = qualitColorMap
                colorMapList = colorBackgroundList[qualitColorMap]
              }}
              style="background: linear-gradient(90deg, {colorBackgroundList[qualitColorMap]})" />
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
  }
  .group {
    background: #f0f0f0;
    border-radius: 7.5px;
    padding: 2px;
    margin-top: 1px;
    padding-bottom: 4px;

    @media (prefers-color-scheme: dark) {
      background: #212125;
      color: white;
    }

    .slider {
      --range-handle-focus: #2196f3;
      --range-range-inactive: #2196f3;
      --range-handle-inactive: #2196f3;
      --range-handle: #2196f3;
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
</style>
