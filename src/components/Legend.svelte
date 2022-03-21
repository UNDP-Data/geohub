<script lang="ts">
  import Slider from '@smui/slider'
  import { sequentialColormaps, divergingColorMaps, cyclicColorMaps } from '../lib/colormaps'
  import Button, { Label as LabelButton } from '@smui/button'
  import Chip, { Set, Text } from '@smui/chips'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import { map } from '../stores/index'
  // The updateParamsInURL takes params in the format {"key:"value"}

  export let lMin
  export let lMax
  let colorMapName = 'viridis'
  export let layerConfig: Layer = LayerInitialValues
  export let disabled = true

  let name: string, definition: LayerDefinition
  ;({ name, definition } = layerConfig)
  const layerId = definition.id

  const iconButtonStyle = 'font-size: 18px; width: 24px; height: 24px;'
  let selectedColorMapType = ''
  let sliderMin = Math.floor(lMin)
  let sliderMax = Math.ceil(lMax)
  let scalingValueStart = Math.floor(lMin * 10) / 10
  let scalingValueEnd = Math.ceil(lMax * 10) / 10
  const colorMapTypes: Array<string> = ['Sequential', 'Diverging', 'Cyclic']
  let cmapSelectionShown = false
  let mapLayers = $map.getStyle().layers
  let scalingValueRange = `${scalingValueStart},${scalingValueEnd}`

  const setScalingValueRwange = () => {
    scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  }

  $: scalingValueStart, setScalingValueRwange()
  $: scalingValueEnd, setScalingValueRwange()
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

  let legendBackground

  const generateLegend = () => {
    const allColorMaps = sequentialColormaps.concat(divergingColorMaps, cyclicColorMaps)
    let activeColorMap = allColorMaps.filter((item) => item.name === colorMapName).pop()
    legendBackground = activeColorMap.background
    updateParamsInURL({ colormap_name: activeColorMap.name })
  }

  const selectScaling = () => {
    if (!scalingValueRange) return
    updateParamsInURL({ rescale: scalingValueRange })
  }

  $: scalingValueStart, setScalingValueRwange()
  $: scalingValueEnd, setScalingValueRwange()
  $: scalingValueEnd, selectScaling()
  $: colorMapName, generateLegend()
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
    <Button class="changelegendbtn" variant="raised">
      <LabelButton>Change legend</LabelButton>
    </Button>
  </div>
</div>
<div class="group">
  <h4>Show this</h4>
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
    padding-bottom: 4px;
  }

  :global(.changeLegendButtonDiv) {
    margin: 0 auto;
    width: 50%;
  }

  :global(.changelegendbtn) {
    text-transform: capitalize;
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
