<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'

  import Popper from '$lib/popper'
  import type { Color, IntervalLegendColorMapRow, Layer } from '$lib/types'
  import DefaultColorPicker from '$components/DefaultColorPicker.svelte'

  export let colorMapRow: IntervalLegendColorMapRow
  export let colorPickerVisibleIndex: number
  export let layer: Layer

  const dispatch = createEventDispatcher()

  let color: Color
  let colorMapName: string
  let colorPickerStyle: string
  let showToolTip = false

  $: colorPickerStyle = getColorPickerStyle(colorMapRow.color.join())
  $: {
    if (colorPickerVisibleIndex === colorMapRow.index) {
      showToolTip = true
    } else {
      showToolTip = false
    }
  }

  $: color, updateColorMap(color)

  // load color map upon change of layer color map name
  $: {
    if (layer.colorMapName !== colorMapName) {
      colorMapName = layer.colorMapName
      setColorFromProp()
    }
  }

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-end',
      strategy: 'fixed',
    },
    [10, 15],
  ).init()

  // set color based on default value
  const setColorFromProp = () => {
    const rowColor: number[] = colorMapRow.color
    const r = rowColor[0]
    const g = rowColor[1]
    const b = rowColor[2]

    color = {
      r,
      g,
      b,
      hex: chroma([r, g, b]).hex('rgba'),
      h: chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }
  }

  const getColorPickerStyle = (rgb: string) => {
    return `caret-color:rgb(${rgb}); background-color: rgb(${rgb})`
  }

  // set color of display and dispatch to update map
  const updateColorMap = (colorSelected: Color) => {
    if (colorSelected) {
      try {
        const rgba: number[] = chroma(colorSelected['hex']).rgba()
        colorMapRow.color = [...rgba.slice(0, -1), ...[rgba[3] * 255]]
        colorPickerStyle = getColorPickerStyle(chroma(colorSelected['hex']).rgba().join())
        dispatch('changeColorMap', {
          color,
        })
      } catch (e) {
        console.log(e)
      }
    }
  }

  const handleColorPickerClick = () => {
    if (showToolTip === false) {
      dispatch('clickColorPicker', { index: colorMapRow.index })
    } else {
      showToolTip = false
    }
  }
</script>

<div class="grid-x grid-margin-x medium-up-3">
  <div class="cell">
    <div
      id={`interval-${colorMapRow.index}`}
      on:click={() => handleColorPickerClick()}
      use:popperRef
      class="discrete"
      alt="Color Picker"
      title="Color Picker"
      style={colorPickerStyle} />
  </div>
  {#if showToolTip && color}
    <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
      <DefaultColorPicker bind:color on:closeColorPicker={() => handleColorPickerClick()} />
      <div id="arrow" data-popper-arrow />
    </div>
  {/if}
  <div class="cell">&#x2014;</div>
  <div class="cell">
    {colorMapRow.end}
  </div>
</div>

<style lang="scss">
  @import 'src/styles/undp-design/base-minimal.min';
  @import 'src/styles/popper.scss';

  $input-margin: 0px !important;

  .grid-x {
    width: 30%;
  }
  .cell {
    margin-top: 2%;
    cursor: pointer;
    .discrete {
      width: 20px;
      height: 20px;
      &:hover {
        padding: 0;
        border: 1px solid rgb(255, 255, 0);
      }
    }
  }

  #tooltip {
    height: 230px;
    padding: 0;
    width: 170px;
  }
</style>
