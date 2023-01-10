<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'
  import { abs } from 'mathjs'
  import ColorPicker from '$components/controls/ColorPicker.svelte'
  import Popper from '$lib/popper'
  import type { Color, IntervalLegendColorMapRow, Layer } from '$lib/types'

  export let colorMapRow: IntervalLegendColorMapRow
  export let colorPickerVisibleIndex: number
  export let layer: Layer
  export let colorMapName: string
  export let rowWidth
  const dispatch = createEventDispatcher()
  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-start',
      strategy: 'fixed',
    },
    [10, 15],
  ).init()

  let color: Color
  let colorPickerStyle: string
  let showToolTip = false
  $: colorPickerStyle = getColorPickerStyle(colorMapRow?.color.join())
  $: {
    if (colorPickerVisibleIndex === colorMapRow?.index) {
      showToolTip = true
    } else {
      showToolTip = false
    }
  }

  $: color, updateColorMap(color)

  // load color map upon change of layer color map name
  $: colorMapName, setColorFromProp()

  // set color based on default value
  const setColorFromProp = () => {
    const rowColor: number[] = colorMapRow.color
    const r = rowColor[0]
    const g = rowColor[1]
    const b = rowColor[2]

    // sometimes h is NaN, causing the colorpicker to break
    // To curb this, force it to zero
    color = {
      r,
      g,
      b,
      hex: chroma([r, g, b]).hex('rgba'),
      h: isNaN(chroma([r, g, b]).hsv()[0]) ? 0 : chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }
  }

  const getColorPickerStyle = (rgb: string) => {
    return `caret-color:rgba(${rgb}); background-color: rgba(${rgb})`
  }

  // set color of display and dispatch to update map
  const updateColorMap = (colorSelected: Color) => {
    if (colorSelected) {
      try {
        let rgba: number[] = chroma(colorSelected['hex']).rgba()
        /*the fix below is necessary becuse the Color picker has some roounding bugs
          which makde the color returnd change slightly on multiple consecutive invocations
          and this triggered map rerendering in vain
        */
        rgba = [...rgba.slice(0, -1), ...[Number((rgba[3] * 255).toFixed(2))]]

        const delta = rgba.map((el, i) => abs(el - colorMapRow.color[i])).reduce((a, b) => a + b, 0)
        if (delta > 4) {
          colorMapRow.color = rgba
          colorPickerStyle = getColorPickerStyle(chroma(colorSelected['hex']).rgba().join())
          dispatch('changeColorMap', {
            color,
          })
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  const handleColorPickerClick = () => {
    if (showToolTip === false) {
      dispatch('clickColorPicker', { index: colorMapRow.index })
    } else {
      dispatch('closeColorPicker')
      showToolTip = false
    }
  }

  const handleInput = (e) => {
    const id = e.target.id
    const value = (e.target as HTMLInputElement).value

    dispatch('changeIntervalValues', {
      index: colorMapRow.index,
      id,
      value: parseFloat(value),
    })
  }
</script>

<div class="columns is-mobile p-0 m-0 py-1">
  <div class="column is-2 p-0 m-0">
    <div
      alt="Color Map Control"
      title="Color Map Control"
      use:popperRef
      on:click={() => handleColorPickerClick()}
      class="discrete"
      style="{colorPickerStyle}; width:20px; height:20px" />
    {#if showToolTip && color}
      <div
        id="tooltip"
        data-testid="tooltip"
        use:popperContent={popperOptions}
        transition:fade>
        <ColorPicker
          bind:color
          on:closeColorPicker={() => handleColorPickerClick()} />
        <div
          id="arrow"
          data-popper-arrow />
      </div>
    {/if}
  </div>
  <div class="column p-0 m-0">
    <input
      style="width:{rowWidth * 8}px"
      class="number-input"
      id="start"
      type="number"
      value={colorMapRow.start}
      on:change={handleInput}
      required />
  </div>
  {#if colorMapRow.end}
    <div class="is-3 column p-0 m-0"><p style="margin-left: {rowWidth + 5}px">—</p></div>
    <div class="column p-0 m-0">
      <input
        style="width:{rowWidth * 8}px"
        class="number-input"
        type="number"
        id="end"
        value={colorMapRow.end}
        on:change={handleInput}
        required />
    </div>
  {/if}
</div>

<style lang="scss">
  @import '../../styles/popper.scss';

  $input-margin: 5px !important;

  .number-input {
    width: 100%;
    text-align: left;
    border: none;
    background-color: transparent;
  }

  .discrete {
    cursor: pointer !important;
    height: 20px;
    width: 20px;
    border: 1px solid gray;
  }

  :global(.discrete):hover {
    padding: 0;
    border: 2px solid rgb(0, 0, 0);
  }

  input:focus {
    outline: none;
    background: rgb(220, 220, 220, 0.3);
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  #tooltip {
    height: 280px;
    padding: 0;
    width: 290px;
    max-width: 290px;
  }
</style>
