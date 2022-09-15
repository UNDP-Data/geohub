<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma, { rgb } from 'chroma-js'

  import Popper from '$lib/popper'
  import type { Color, IntervalLegendColorMapRow, Layer } from '$lib/types'
  import DefaultColorPicker from '$components/DefaultColorPicker.svelte'
  import { isEqual } from 'lodash-es'
  import { abs } from 'mathjs'

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
      h: isNaN(chroma([r, g, b]).hsv()[0]) ? 0 : chroma([r, g, b]).hsv()[0],
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
</script>

{#if colorMapRow.start !== colorMapRow.end}
  <div class="unique-value">
    <div
      id={`interval-${colorMapRow.index}`}
      on:click={() => handleColorPickerClick()}
      use:popperRef
      class="discrete"
      alt="Color Picker"
      title="Color Picker"
      style={colorPickerStyle} />
    {#if showToolTip && color}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <DefaultColorPicker bind:color on:closeColorPicker={() => handleColorPickerClick()} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
    <!--    <div class="cell" style="width:min-content">{colorMapRow.start}</div>-->
    <div class="space-arrow" style="width:min-content">&nbsp;&#x21A6;</div>
    <div class="label-text">
      {colorMapRow.end ? colorMapRow.end : colorMapRow.start}
    </div>
    <!--    Todo: When the labels for unique values are present-->
  </div>
{:else}
  <div class="unique-value-no-label">
    <div
      id={`interval-${colorMapRow.index}`}
      on:click={() => handleColorPickerClick()}
      use:popperRef
      class="discrete"
      alt="Color Picker"
      title="Color Picker"
      style={colorPickerStyle} />
    {#if showToolTip && color}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <DefaultColorPicker bind:color on:closeColorPicker={() => handleColorPickerClick()} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
    <div class="arrow">&nbsp; &#x21A6;</div>
    <div class="text">
      {colorMapRow.start}
    </div>
  </div>
{/if}

<style lang="scss">
  @import 'src/styles/undp-design/base-minimal.min';
  @import 'src/styles/popper.scss';

  $input-margin: 0px !important;

  .unique-value-no-label {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    align-items: center;
    justify-items: center;
    margin-top: 2px;
    width: max-content;
    .discrete {
      width: 20px;
      height: 20px;
      margin-right: auto;
    }
  }

  .unique-value {
    display: grid;
    grid-template-columns: 1fr 0.5fr 3fr;
    grid-template-rows: 1fr;
    grid-template-areas: 'discrete space-arrow text';
    grid-gap: 0px 0px;
    align-items: center;
    justify-items: center;
    margin-top: 2px;
    padding: 0px 0px 0px 0px;
    width: 100%;
    height: 100%;
  }
  .label-text {
    font-weight: 400;
    margin-left: 0;
    margin-right: auto;
    padding: 0px 0px 0px 0px;
  }
  .space-arrow {
    max-width: max-content;
    white-space: nowrap;
    grid-area: space-arrow;
    margin-right: auto;
    width: min-content;
  }

  .discrete {
    width: 20px;
    height: 20px;
    margin-right: auto;
  }

  #tooltip {
    height: 230px;
    padding: 0;
    width: 170px;
  }
</style>
