<script lang="ts">
  import Chip, { Set, Text } from '@smui/chips'
  import Checkbox from '@smui/checkbox'
  import FormField from '@smui/form-field'
  import Slider from '@smui/slider'
  import { layerList } from '../stores/stores'
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
  let lMin = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  let lMax = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  const diffValue = (lMax - lMin) * 0.5
  let lMinScaling = Math.floor(lMin - diffValue)
  let lMaxScaling = Math.ceil(lMax + diffValue)
  let scalingValueStart = Math.floor(lMin * 10) / 10
  let scalingValueEnd = Math.ceil(lMax * 10) / 10
  export let scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  const setScalingValueRwange = () => {
    scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  }
  $: scalingValueStart, setScalingValueRwange()
  $: scalingValueEnd, setScalingValueRwange()
  export let reverseColorMap = false
</script>

<div class="paper-container">
  <Slider
    discrete
    range
    bind:start={scalingValueStart}
    bind:end={scalingValueEnd}
    min={lMinScaling}
    max={lMaxScaling}
    step={0.1}
    input$aria-label="Range slider"
  />

  <div>
    <FormField>
      <Checkbox bind:checked={reverseColorMap} />
      <span>Reverse color</span>
    </FormField>
  </div>
  <Set chips={colorMapTypes} let:chip choice bind:selected={selectedColorMapType}>
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
            style={btn.background}
          />
        {/each}
      </div>
    {:else if selectedColorMapType === 'Diverging'}
      <span>Current colormap: {colorMapName}</span>
      <div class="colormaps-group">
        {#each divergingColorMaps as btn}
          <div
            title={btn.name}
            class="colormap-div"
            on:click={() => (colorMapName = btn['name'])}
            style={btn.background}
          />
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
            style={btn.background}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  * :global(.colormap-div) {
    width: 10%;
    height: 100px;
    margin: 2px;
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
</style>
