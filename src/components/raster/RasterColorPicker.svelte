<script lang="ts">
  import ColorPicker from 'svelte-awesome-color-picker/ColorPicker.svelte'
  import type { Color } from 'svelte-awesome-color-picker/type/types'

  export let color: Color
</script>

<div class="raster-color-picker-container">
  <div class="arrow" />
  <ColorPicker isPopup={true} isInput={false} isAlpha={true} toRight={true} isOpen={true} bind:color />
</div>

<style lang="scss">
  .raster-color-picker-container {
    --picker-height: 150px;
    --picker-width: 150px;
    position: relative;
    top: -15px;

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
    width: 170px;
  }

  // handles
  :global(.picker > div, .slider > div.to-right, .alpha > div.to-right) {
    border-color: #fff;
    border-width: 2px;
    width: 10px;
    height: 10px;
    background: #000 !important;
    top: 5px;
    cursor: pointer;
  }

  :global(.slider, .alpha) {
    cursor: pointer;
    height: 10px !important;
    width: 150px !important;
  }

  :global(div.isOpen.isPopup) {
    border-color: #ccc;
  }

  :global(div.isOpen.isPopup div:nth-child(2), div.isOpen.isPopup div:nth-child(3)) {
    height: 10px;
  }
</style>
