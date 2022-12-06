<script lang="ts">
  import ColorPicker, { ChromeVariant } from 'svelte-awesome-color-picker'
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { clickOutside } from 'svelte-use-click-outside'
  import type { Color } from '$lib/types'
  import chroma from 'chroma-js'

  const dispatch = createEventDispatcher()

  export let color: Color
  let rgb: { r: number; g: number; b: number; a: number } = { r: color.r, g: color.g, b: color.b, a: color.a }

  const setColor = () => {
    if (!rgb) return
    const { r, g, b, a } = rgb
    color = {
      r,
      g,
      b,
      a,
      hex: chroma([r, g, b]).hex('rgba'),
      h: isNaN(chroma([r, g, b]).hsv()[0]) ? 0 : chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }
    return color
  }

  const changeColor = () => {
    setColor()
    dispatch('changeColor')
  }

  const handleClose = () => {
    dispatch('closeColorPicker', { index: -1 })
  }

  $: rgb, changeColor()
</script>

<div
  class="default-color-picker-container"
  data-testid="default-color-picker-container"
  use:clickOutside={handleClose}>
  <div
    class="close is-clickable"
    alt="Close Color Picker"
    title="Close Color Picker"
    on:click={handleClose}>
    <Fa
      icon={faXmark}
      size="sm" />
  </div>
  <ColorPicker
    components={ChromeVariant}
    isPopup={true}
    isInput={false}
    isTextInput={false}
    isAlpha={true}
    toRight={true}
    isOpen={true}
    bind:rgb />
</div>

<style lang="scss">
  .default-color-picker-container {
    position: relative;

    .close {
      position: absolute;
      right: 10px;
      z-index: 100;
    }
  }

  // picker container
  :global(.isPopup, .picker) {
    border: 0;
    cursor: pointer;
  }

  :global(div.isOpen.isPopup) {
    border: 0;
    margin: 0;
    padding: 10px;
  }

  :global(div.isOpen.isPopup div:nth-child(2), div.isOpen.isPopup div:nth-child(3)) {
    height: 10px;
  }
</style>
