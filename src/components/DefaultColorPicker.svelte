<script lang="ts">
  import ColorPicker from 'svelte-awesome-color-picker'
  import type { Color } from 'svelte-awesome-color-picker'
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

<div class="default-color-picker-container" data-testid="default-color-picker-container" use:clickOutside={handleClose}>
  <div class="close is-clickable" alt="Close Color Picker" title="Close Color Picker" on:click={handleClose}>
    <Fa icon={faXmark} size="sm" />
  </div>
  <ColorPicker isPopup={true} isInput={false} isAlpha={true} toRight={true} isOpen={true} bind:color />
</div>

<style lang="scss">
  .default-color-picker-container {
    --picker-height: 150px;
    --picker-width: 150px;
    position: relative;
    top: 8.5px;

    .close {
      position: absolute;
      left: 150px;
      z-index: 100;
    }
  }

  // picker container
  :global(.isPopup, .picker) {
    border: 0;
    cursor: pointer;
    margin-top: 10px;
    width: 120px;
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
    top: 5px;
    width: 150px !important;
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
