<script lang="ts">
  import Chip, { Set, Text } from '@smui/chips'
  import Checkbox from '@smui/checkbox'
  import FormField from '@smui/form-field'
  import Slider from '@smui/slider'
  import { layerList } from '../stores'
  import { sequentialColormaps, divergingColorMaps, cyclicColorMaps } from '../lib/colormaps'

  const colorMapTypes: Array<string> = ['Sequential', 'Diverging', 'Cyclic']
  let selectedColorMapType = ''
  export let colorMapName = 'viridis'

  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'

  export let layerConfig: Layer = LayerInitialValues

  let definition: LayerDefinition
  ;({ definition } = layerConfig)
  const layerId = definition.id
  const layer = $layerList.filter((item) => item.definition.id === layerId).pop()
  export let lMin = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  export let lMax = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])

  const step = 0.1
  let sliderMin = Math.floor(lMin)
  let sliderMax = Math.ceil(lMax)
  let scalingValueStart = Math.floor(lMin * 10) / 10
  let scalingValueEnd = Math.ceil(lMax * 10) / 10

  if ((scalingValueStart - scalingValueEnd / step) % 1 !== 0) {
    sliderMin = Math.round(Math.floor(lMin))
    sliderMax = Math.round(Math.ceil(lMax))
    scalingValueStart = Math.round(Math.floor(lMin * 10) / 10)
    scalingValueEnd = Math.round(Math.ceil(lMax * 10) / 10)
  }

  export let scalingValueRange = `${scalingValueStart},${scalingValueEnd}`

  const setScalingValueRwange = () => {
    scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  }

  $: scalingValueStart, setScalingValueRwange()
  $: scalingValueEnd, setScalingValueRwange()
  export let reverseColorMap = false
</script>

<div class="paper-container">
  <div style="display: flex; align-items: center;">
    <div style="width: 100%;">
      <Slider
        discrete
        range
        bind:start={scalingValueStart}
        bind:end={scalingValueEnd}
        min={sliderMin}
        max={sliderMax}
        {step} />
    </div>
  </div>

  <div style="display: flex; align-items: center; justify-content: center">
    <FormField>
      <Checkbox
        bind:checked={reverseColorMap}
        style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;" />
      <span>Reverse color</span>
    </FormField>
  </div>
  <Set class="colormap-chips" chips={colorMapTypes} let:chip choice bind:selected={selectedColorMapType}>
    <Chip {chip}>
      <Text>{chip}</Text>
    </Chip>
  </Set>
  <div>
    {#if selectedColorMapType === 'Sequential'}
      <span>Current colormap: {colorMapName}</span>

      <div class="colormaps-group">
        {#each sequentialColormaps as btn}
          <div
            title={btn.name}
            class="colormap-div"
            on:click={() => (colorMapName = btn['name'])}
            style={btn.background} />
        {/each}
      </div>
    {:else if selectedColorMapType === 'Diverging'}
      <span>Current colormap: {colorMapName}</span>
      <div class="colormaps-group">
        {#each divergingColorMaps as btn}
          <div
            class="colormap-div"
            title={btn.name}
            on:click={() => {
              colorMapName = btn['name']
            }}
            style={btn.background} />
        {/each}
      </div>
    {:else if selectedColorMapType === 'Cyclic'}
      <span>Current colormap: {colorMapName}</span>
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

<style lang="scss">
  * :global(.colormap-div) {
    width: 15px;
    height: 100px;
    margin: 1px;
    cursor: pointer;
    border-radius: 5px;
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
