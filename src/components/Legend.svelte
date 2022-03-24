<script context="module">
  const lState = {}
</script>

<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import { sequentialColormaps, divergingColorMaps, cyclicColorMaps } from '../lib/colormaps'
  import Button, { Label as LabelButton } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import { map, layerList } from '../stores/index'
  import chroma from 'chroma-js'

  export let lMin
  export let lMax
  export let scalingValueStart
  export let scalingValueEnd
  export let layerConfig: Layer = LayerInitialValues
  let disabled = true
  let step = 0.1
  let rangeSliderValues = [scalingValueStart, scalingValueEnd]
  $: {
    scalingValueStart = rangeSliderValues[0]
    scalingValueEnd = rangeSliderValues[1]
  }

  // export let colorMapName = 'viridis'

  let name: string, definition: LayerDefinition
  ;({ name, definition } = layerConfig)
  const layerId = definition.id

  const iconButtonStyle = 'font-size: 18px; width: 24px; height: 24px;'
  let selectedColorMapType = ''
  let sliderMin = Math.floor(lMin)
  let sliderMax = Math.ceil(lMax)
  const colorMapTypes: Array<string> = ['Sequential', 'Diverging', 'Cyclic']
  let cmapSelectionShown = false
  let changeLegend = false
  let mapLayers = $map.getStyle().layers
  let scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  let isLegendUniqueValues: boolean
  let isLegendInterval: boolean

  // export let reverseColorMap = false

  const remap = (input, oldMin, oldMax, newMin = 0, newMax = 255) => {
    const percent = (input - oldMin) / (oldMax - oldMin)
    const output = percent * (newMax - newMin) + newMin
    return Math.round(output)
  }
  let layer = $layerList.filter((item) => item.definition.id === layerId).pop()

  const layerBandMetadataUniqueV = layer.info['band_metadata'][0][1]['STATISTICS_UNIQUE_VALUES']
  const layerSrc = $map.getSource(layer.definition.source)

  const lURL = new URL(layerSrc.tiles[0])
  let colorMapName = lURL.searchParams.get('colormap_name')
  let cmapListRBG
  let uniqueValueLegendExists = false

  const setUniqueValueLegend = () => {
    let layerSrc = mapLayers.filter((item) => item.id === layerId).pop()['source']
    const layerSource = $map.getSource(layerSrc)
    let cmapObject = {}
    let oldColorMapName
    if (layerSource.tiles) {
      const oldUrl = new URL(layerSource.tiles[0])

      if (uniqueValueLegendExists) {
        oldColorMapName = oldUrl.searchParams.get('colormap')
      } else {
        oldColorMapName = oldUrl.searchParams.get('colormap_name')
        oldUrl.searchParams.delete('colormap_name')
      }
      cmapListRBG = chroma.scale(oldColorMapName).domain([0, 255]).colors(layerBandMetadataUniqueV.length, 'rgba')
      layerBandMetadataUniqueV.forEach(
        (key, i) =>
          (cmapObject[
            remap(key, layerBandMetadataUniqueV[0], layerBandMetadataUniqueV[layerBandMetadataUniqueV.length - 1])
          ] = cmapListRBG[i].rgb()),
      )

      uniqueValueLegendExists = true
      console.log(cmapListRBG)
      console.log(cmapObject)
      // let encodedCmap = encodeURIComponent(JSON.stringify(cmapObject))
      let encodedCmap = JSON.stringify(cmapObject)
      console.log(encodedCmap)

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

  let cmapList = chroma.scale(colorMapName).domain([0, 255]).colors(layerBandMetadataUniqueV.length, 'rgba')
  console.log(cmapList)

  // let cmap = chroma.scale('viridis').domain([lMin, lMax])

  /*
  loop through the unique
  generate divs
  apply the background color
  * */
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
      {#if selectedColorMapType === 'Sequential'}
        <div class="colormaps-group">
          {#each sequentialColormaps as btn}
            <div
              title={btn.name}
              class="colormap-div"
              on:click={() => {
                colorMapName = btn['name']
                console.log(colorMapName)
              }}
              style={btn.background} />
          {/each}
        </div>
      {:else if selectedColorMapType === 'Diverging'}
        <div class="colormaps-group">
          {#each divergingColorMaps as btn}
            <div
              class="colormap-div"
              title={btn.name}
              on:click={() => (colorMapName = btn['name'])}
              style={btn.background} />
          {/each}
        </div>
      {:else if selectedColorMapType === 'Cyclic'}
        <div class="colormaps-group">
          {#each cyclicColorMaps as btn}
            <div
              title={btn.name}
              class="colormap-div"
              on:click={() => (colorMapName = btn['name'])}
              style={btn.background} />
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
      --width: 80%;
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
