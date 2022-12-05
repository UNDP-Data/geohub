<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'

  import ColorPicker from '$components/controls/ColorPicker.svelte'
  import Popper from '$lib/popper'
  import type { Color, HeatmapColorRow } from '$lib/types'

  export let colorRow: HeatmapColorRow
  export let colorPickerVisibleIndex: number

  const dispatch = createEventDispatcher()

  let color: Color
  let colorPickerStyle: string
  let showToolTip = false

  $: color, updateColorMap(color)
  $: colorPickerStyle = getColorPickerStyle(colorRow?.color)
  $: {
    if (colorPickerVisibleIndex === colorRow?.index) {
      showToolTip = true
    } else {
      showToolTip = false
    }
  }

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

  onMount(() => {
    setColorFromProp()
  })

  // set color based on default value
  const setColorFromProp = () => {
    const rowColor: Color = colorRow.color
    const r = rowColor.r
    const g = rowColor.g
    const b = rowColor.b

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

  // set color of display and dispatch to update map
  const updateColorMap = debounce((colorSelected: Color) => {
    console.log(colorSelected)
    if (colorSelected) {
      try {
        const rgba: number[] = chroma([colorSelected.r, colorSelected.g, colorSelected.b]).rgba()
        colorRow.color.r = rgba[0]
        colorRow.color.g = rgba[1]
        colorRow.color.b = rgba[2]
        colorRow.color.a = rgba[3] * 255
        colorPickerStyle = getColorPickerStyle(colorRow.color)
        dispatch('changeColorMap')
      } catch (e) {
        console.log(e)
      }
    }
  }, 50)

  const getColorPickerStyle = (color: Color) => {
    const rgb = [color.r, color.g, color.b].join()
    return `caret-color:rgb(${rgb}); background-color: rgb(${rgb})`
  }

  const handleColorPickerClick = () => {
    if (showToolTip === false) {
      dispatch('clickColorPicker', { index: colorRow.index })
    } else {
      showToolTip = false
    }
  }
</script>

<div
  class="columns is-vcentered is-gapless color-editor"
  data-testid="heatmap-color-map-row-container">
  <div class="column is-1 color-picker">
    <div
      id={`heatmap-${colorRow?.index}`}
      alt="Color Map Control"
      title="Color Map Control"
      on:click={() => handleColorPickerClick()}
      class="discrete"
      use:popperRef
      style={colorPickerStyle} />

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

  <div class="column value">
    <input
      id="start"
      alt="Value"
      title="Value"
      class="input is-small is-static"
      type="number"
      readonly
      value={colorRow?.value} />
  </div>
</div>

<style lang="scss">
  @import '../../../styles/popper.scss';

  $input-margin: 5px !important;

  .color-editor {
    margin-bottom: $input-margin;
    margin-left: 45px;

    .column.value {
      margin-left: 15px;
    }

    .color-picker {
      margin-right: $input-margin;
    }

    .discrete {
      cursor: pointer;
      height: 20px;
      padding: 1px;
      width: 20px;

      &:hover {
        padding: 0;
        border: 1px solid hsl(204, 86%, 53%);
      }
    }
  }

  #tooltip {
    height: 280px;
    padding: 0;
    width: 290px;
    max-width: 290px;
  }
</style>
