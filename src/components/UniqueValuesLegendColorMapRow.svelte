<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'

  import type { Color, IntervalLegendColorMapRow, Layer } from '$lib/types'
  import DefaultColorPicker from './DefaultColorPicker.svelte'

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
        dispatch('changeColorMap')
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

<div class="columns is-vcentered is-gapless colormap-editor" data-testid="unique-legend-color-map-row-container">
  <div class="column is-1 color-picker">
    <div
      id={`interval-${colorMapRow.index}`}
      on:click={() => handleColorPickerClick()}
      class="discrete"
      style={colorPickerStyle} />

    {#if showToolTip}
      <div class={`tooltip`} transition:fade>
        <DefaultColorPicker bind:color on:closeColorPicker={() => handleColorPickerClick()} />
      </div>
    {/if}
  </div>

  <div class="column is-1 minimum">
    <input
      id="minimum"
      alt="Start Value"
      title="Start Value"
      class="input is-small is-static"
      type="text"
      value={colorMapRow.start} />
  </div>

  <div class="column maximum">
    <input
      id="maximum"
      alt="End Value"
      title="End Value"
      class="input is-small is-static"
      type="text"
      value={colorMapRow.end} />
  </div>
</div>

<style lang="scss">
  $input-margin: 5px !important;

  .colormap-editor {
    margin-bottom: $input-margin;

    .color-picker {
      margin-right: $input-margin;
    }

    .minimum {
      margin-right: $input-margin;
    }

    .discrete {
      cursor: pointer;
      height: 20px !important;
      width: 20px;
    }

    .tooltip-hidden {
      display: none !important;
    }

    .tooltip {
      left: 19px;
      position: relative;
      top: -20px;
      z-index: 10;
    }
  }
</style>
