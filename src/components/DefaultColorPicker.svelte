<script lang="ts">
  import ColorPicker from 'svelte-awesome-color-picker/ColorPicker.svelte'
  import type { Color } from 'svelte-awesome-color-picker/type/types'
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { clickOutside } from 'svelte-use-click-outside'

  export let color: Color

  const dispatch = createEventDispatcher()

  const changeColor = () => {
    dispatch('changeColor')
  }

  const handleClose = () => {
    dispatch('closeColorPicker', { index: -1 })
  }

  $: color, changeColor()
</script>

<div class="raster-color-picker-container" data-testid="raster-color-picker-container" use:clickOutside={handleClose}>
  <div class="close is-clickable" alt="Close Color Picker" title="Close Color Picker" on:click={handleClose}>
    <Fa icon={faXmark} size="sm" />
  </div>
  <div class="arrow" />
  <ColorPicker isPopup={true} isInput={false} isAlpha={true} toRight={true} isOpen={true} bind:color />
</div>

<style lang="scss">
  .raster-color-picker-container {
    --picker-height: 150px;
    --picker-width: 150px;
    position: relative;
    top: -15px;

    .close {
      position: absolute;
      left: 160px;
      z-index: 10;
    }

    .arrow {
      background-color: #fff;
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
      height: 12px;
      left: 4px;
      position: absolute;
      top: 20px;
      transform: rotate(45deg);
      width: 12px;
      z-index: 10;
    }
  }

  // picker container
  :global(.isPopup, .picker) {
    border-radius: 7.5px;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    margin-top: 8px;
    width: 170px;
  }

  // handles
  :global(.picker > div, .slider > div.to-right, .alpha > div.to-right) {
    background: #000 !important;
    border-color: #fff;
    border-width: 2px;
    cursor: pointer;
    height: 10px;
    margin-left: -4px;
    top: 5px;
    width: 10px;
  }

  :global(.slider, .alpha) {
    cursor: pointer;
    height: 10px !important;
    margin-top: 8px;
    width: 150px !important;
  }

  :global(div.isOpen.isPopup) {
    border-color: #ccc;
  }

  :global(div.isOpen.isPopup div:nth-child(2), div.isOpen.isPopup div:nth-child(3)) {
    height: 10px;
  }
</style>
