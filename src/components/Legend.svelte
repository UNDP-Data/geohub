<script context="module">
  const lState = {}
</script>

<script lang="ts">
  import Slider from '@smui/slider'
  import { sequentialColormaps, divergingColorMaps, cyclicColorMaps } from '../lib/colormaps'
  import Button, { Label as LabelButton } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import { map, layerList } from '../stores/index'

  export let lMin
  export let lMax
  export let scalingValueStart
  export let scalingValueEnd
  export let layerConfig: Layer = LayerInitialValues
  let disabled = true
  export let legendBackground
  export let colorMapName = 'viridis'

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

  // const setScalingValueRwange = () => {
  //   scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  //   console.log(scalingValueStart, scalingValueEnd)
  // }

  // $: scalingValueStart, setScalingValueRwange()
  // $: scalingValueEnd, setScalingValueRwange()
  // $: colorMapName, updateParamsInURL({'colormap_name':colorMapName})
  export let reverseColorMap = false

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

  // const generateLegend = () => {
  //   console.log(colorMapName)
  //   const allColorMaps = sequentialColormaps.concat(divergingColorMaps, cyclicColorMaps)
  //   let activeColorMap = allColorMaps.filter((item) => item.name === colorMapName).pop()
  //   legendBackground = activeColorMap.background
  //   updateParamsInURL({ colormap_name: activeColorMap.name })
  // }

  // const selectScaling = () => {
  //   if (!scalingValueRange) return
  //   updateParamsInURL({ rescale: scalingValueRange })
  // }

  const requestDataInfo = () => {
    changeLegend = !changeLegend
    let layer = $layerList.filter((item) => item.definition.id === layerId).pop()
    const layerBandMetadataMax = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM']).toFixed(2)
    const layerBandMetadataMin = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM']).toFixed(2)
    console.log(layer)
    let layerBandRangeValue = layerBandMetadataMax - layerBandMetadataMin
    let uniqueValuesList = []
    let intervalSize = layerBandRangeValue / 10
    if (layerBandRangeValue <= 10) {
      isLegendUniqueValues = true
      isLegendInterval = false

      for (let i = Number(layerBandMetadataMin); i < Number(layerBandMetadataMax); i = i + Number(intervalSize)) {
        console.log(layerBandMetadataMin, layerBandMetadataMax)
        uniqueValuesList.push(i)
      }
      // for(let i=layerBandMetadataMin; i<=layerBandMetadataMax; i = i + 1){
      //   uniqueValuesList.push(i)
      // }
      console.log(uniqueValuesList)
    } else {
      isLegendInterval = true
      isLegendUniqueValues = false
    }
  }

  // $: scalingValueStart, setScalingValueRwange()
  // $: scalingValueEnd, setScalingValueRwange()
  // $: scalingValueRange, selectScaling()
</script>

<div class="group">
  <Slider
    discrete
    range
    bind:start={scalingValueStart}
    bind:end={scalingValueEnd}
    min={sliderMin}
    max={sliderMax}
    step={0.1}
    input$aria-label="Range slider"
    label="Set the min and max" />
  <div style="display: flex; align-items: center; justify-content: space-around;">
    <!-- <div>{scalingValueStart}</div> -->
    <div
      on:click={() => {
        cmapSelectionShown = !cmapSelectionShown
      }}
      class="colormap-div"
      style={legendBackground} />

    <!-- <div>{scalingValueEnd}</div> -->

    <!-- <div style="display: block; height: 100px; width: 20px; margin-right: 10px">

    </div> -->
  </div>
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
    <Button on:click={requestDataInfo} class="changelegendbtn" variant="raised">
      <LabelButton>{changeLegend ? 'Hide Legend' : 'Show Legend'}</LabelButton>
    </Button>
  </div>
</div>
<div class={changeLegend ? 'group changeLegendShown' : 'hidden'}>
  <div id="discrete-cmap" style={legendBackground} />
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
  }

  :global(.changeLegendButtonDiv) {
    margin: 0 auto;
    padding-top: 10px;
    width: 50%;
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
