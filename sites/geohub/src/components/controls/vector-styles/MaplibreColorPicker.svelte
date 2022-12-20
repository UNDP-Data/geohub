<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'

  import ColorPicker from '$components/controls/ColorPicker.svelte'
  import Popper from '$lib/popper'
  import type { Color } from '$lib/types'

  const dispatch = createEventDispatcher()

  export let rgba = `rgba(0,0,0,1)`

  let color: Color = {
    r: chroma(rgba).rgba()[0],
    g: chroma(rgba).rgba()[1],
    b: chroma(rgba).rgba()[2],
    a: chroma(rgba).rgba()[3],
    hex: chroma(rgba).hex('rgb'),
    h: isNaN(chroma(rgba).hsv()[0]) ? 0 : chroma(rgba).hsv()[0],
    s: chroma(rgba).hsv()[1],
    v: chroma(rgba).hsv()[2],
  }

  let showToolTip = false

  const setColor = () => {
    rgba = `rgba(${color.r},${color.g},${color.b},${color.a})`
    dispatch('change', {
      color: rgba,
    })
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

  const handleColorPaletteClick = () => {
    showToolTip === false ? (showToolTip = true) : (showToolTip = false)
  }

  const handleCloseColorPicker = () => {
    showToolTip = false
  }
</script>

<div
  class="color-palette"
  on:click={handleColorPaletteClick}
  alt={rgba}
  title={rgba}
  style="background: {rgba};"
  use:popperRef />
{#if showToolTip}
  <div
    id="tooltip"
    data-testid="tooltip"
    use:popperContent={popperOptions}
    transition:fade>
    <ColorPicker
      bind:color
      on:closeColorPicker={handleCloseColorPicker}
      on:changeColor={setColor} />
    <div
      id="arrow"
      data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  @import '../../../styles/popper.scss';

  .color-palette {
    border: 1px solid hsl(0, 0%, 0%);
    cursor: pointer;
    height: 20px;
    padding: 1px;
    width: 20px;

    &:hover {
      border: 1px solid hsl(204, 86%, 53%);
      padding: 0;
    }
  }

  $tooltip-background: #fff;

  #tooltip {
    height: 280px;
    padding: 0;
    width: 290px;
    max-width: 290px;
  }
</style>
