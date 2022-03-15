<script lang="ts">
  import { sequentialColormaps, divergingColorMaps, cyclicColorMaps } from '../lib/colormaps'

  export let colorMapName
  export let lMax
  export let lMin

  let legendBackground

  const generateLegend = () => {
    const allColorMaps = sequentialColormaps.concat(divergingColorMaps, cyclicColorMaps)
    let activeColorMap = allColorMaps.filter((item) => item.name === colorMapName).pop()
    legendBackground = activeColorMap.background
  }

  $: colorMapName, generateLegend()
</script>

<div style="display: block;">
  <h4 style="margin-left: auto; margin-right: auto; width: 40px">Legend</h4>

  <div style="display: flex; align-items: center; justify-content: center;">
    <div style="display: block; height: 100px; width: 20px; margin-right: 2px">
      <h6 style="margin-top: 0">{lMax}</h6>
      <h6 style="margin-top: 300%">{lMin}</h6>
    </div>
    <div class="colormap-div" style={legendBackground} />
  </div>
</div>

<style lang="scss">
  .colormap-div {
    height: 100px;
    width: 20px;
  }
</style>
