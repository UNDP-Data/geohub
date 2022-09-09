<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'

  import DefaultColorPicker from '$components/DefaultColorPicker.svelte'
  import Popper from '$lib/popper'
  import type { Color, IntervalLegendColorMapRow, Layer } from '$lib/types'

  export let colorMapRow: IntervalLegendColorMapRow
  export let colorPickerVisibleIndex: number
  export let layer: Layer

  const dispatch = createEventDispatcher()
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

  let color: Color
  let colorMapName: string
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
  $: {
    if (layer?.colorMapName !== colorMapName) {
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
    return `caret-color:rgb(${rgb}); background-color: rgb(${rgb})`
  }

  // set color of display and dispatch to update map
  const updateColorMap = debounce((colorSelected: Color) => {
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
  }, 50)

  const handleColorPickerClick = () => {
    if (showToolTip === false) {
      dispatch('clickColorPicker', { index: colorMapRow.index })
    } else {
      showToolTip = false
    }
  }

  const handleInput = (e) => {
    const id = e.target.id
    const value = (e.target as HTMLInputElement).value
    // const value = e.target.textContent

    if (id === 'start') {
      colorMapRow.start = isNaN(parseFloat(value)) ? 0 : parseFloat(value)
    }
    if (id === 'end') {
      colorMapRow.end = isNaN(parseFloat(value)) ? 0 : parseFloat(value)
    }

    dispatch('changeIntervalValues', {
      index: colorMapRow.index,
      id,
      value: parseFloat(value),
    })
  }
</script>

<!--<div class="columns is-vcentered is-gapless colormap-editor" data-testid="intervals-legend-color-map-row-container">-->

<div class="grid-x">
  <div class="cell small-2">
    <div
      id={`interval-${colorMapRow?.index}`}
      alt="Color Map Control"
      title="Color Map Control"
      use:popperRef
      on:click={() => handleColorPickerClick()}
      class="discrete"
      style="{colorPickerStyle}; width:20px; height:20px" />
    {#if showToolTip && color}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <DefaultColorPicker bind:color on:closeColorPicker={() => handleColorPickerClick()} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
  </div>
  <div class="cell small-4">
    <input
      style="border: none; width: fit-content"
      id="start"
      type="number"
      value={colorMapRow.start}
      on:input={handleInput} />
  </div>
  <div class="cell small-2">—</div>
  <div class="cell small-4">
    <input style="border: none" id="end" type="number" value={colorMapRow.end} on:input={handleInput} />
  </div>
</div>

<style lang="scss">
  @import '../styles/popper.scss';
  @import '../styles/undp-design/base-minimal.min';

  $input-margin: 5px !important;

  .cell {
    padding: 0 !important;
    margin-top: 2%;
  }

  .discrete {
    cursor: pointer !important;
    height: 20px;
    width: 20px;
  }

  .discrete:hover {
    padding: 0;
    border: 1px solid rgb(255, 255, 0);
  }

  input:focus {
    outline: none;
    background: rgb(220, 220, 220, 0.3);
  }
  .colormap-editor {
    margin-bottom: $input-margin;

    .column.end {
      margin-left: 5px;
    }

    .color-picker {
      margin-right: $input-margin;
    }

    .discrete {
      cursor: pointer !important;
      height: 20px;
      width: 20px;

      &:hover {
        padding: 0;
        border: 1px solid hsl(204, 86%, 53%);
      }
    }
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
    height: 230px;
    padding: 0;
    width: 170px;
  }
</style>
