<script lang="ts">
  import ColorPicker, { ChromeVariant } from 'svelte-awesome-color-picker'
  // import type { Rgb } from 'svelte-awesome-color-picker/type/types'
  // import type { colord } from 'colord';
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { clickOutside } from 'svelte-use-click-outside'

  export let color: { r: 255; g: 0; b: 0; a: 1 }

  const dispatch = createEventDispatcher()

  const changeColor = () => {
    dispatch('changeColor')
  }

  const handleClose = () => {
    dispatch('closeColorPicker', { index: -1 })
  }

  $: color, changeColor()
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
    bind:rgb={color} />
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
