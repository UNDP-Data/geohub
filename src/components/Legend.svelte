<script lang="ts">
  import Slider from '@smui/slider'
  import { sequentialColormaps, divergingColorMaps, cyclicColorMaps } from '../lib/colormaps'
  import Button, { Label as LabelButton } from '@smui/button'
  export let lMin
  export let lMax

  const iconButtonStyle = 'font-size: 18px; width: 24px; height: 24px;'

  let sliderMin = Math.floor(lMin)
  let sliderMax = Math.ceil(lMax)
  let scalingValueStart = Math.floor(lMin * 10) / 10
  let scalingValueEnd = Math.ceil(lMax * 10) / 10

  export let scalingValueRange = `${scalingValueStart},${scalingValueEnd}`

  const setScalingValueRwange = () => {
    scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  }

  $: scalingValueStart, setScalingValueRwange()
  $: scalingValueEnd, setScalingValueRwange()
  export let reverseColorMap = false
  export let colorMapName

  let legendBackground

  const generateLegend = () => {
    const allColorMaps = sequentialColormaps.concat(divergingColorMaps, cyclicColorMaps)
    let activeColorMap = allColorMaps.filter((item) => item.name === colorMapName).pop()
    legendBackground = activeColorMap.background
  }

  $: colorMapName, generateLegend()
</script>

<div class="group">
  <div style="display: flex; align-items: center; justify-content: space-around;">
    <!-- <div>{scalingValueStart}</div> -->
    <div class="colormap-div" style={legendBackground} />

    <!-- <div>{scalingValueEnd}</div> -->

    <!-- <div style="display: block; height: 100px; width: 20px; margin-right: 10px">

    </div> -->
  </div>
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

  <Button variant="raised" class="changeLegendButton">
    <LabelButton>Change legend</LabelButton>
  </Button>
</div>

<style lang="scss">
  .colormap-div {
    height: 20px;
    width: 80%;
    // transform: rotate(90deg) ;
  }
  .group {
    background: #f0f0f0;
    border-radius: 7.5px;
    padding: 2px;
    padding-bottom: 4px;
  }

  :global(.changeLegendButton) {
    margin: 0 auto;
    width: 50%;
    text-transform: capitalize;
  }
</style>
