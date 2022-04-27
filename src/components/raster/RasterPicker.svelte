<script>
  import ColorPicker from 'svelte-awesome-color-picker/ColorPicker.svelte'
  export let color
</script>

<div>
  <ColorPicker isPopup={true} wrapper="span" isInput={false} toRight={true} isAlpha={true} isOpen={true} bind:color />
</div>

<style lang="scss">
  :global(.isPopup) {
    width: 150px !important;
    height: 150px !important;
    border: none;
    cursor: crosshair;
  }
  :global(.picker) {
    width: 150px !important;
    height: 150px !important;
    border-radius: 5px;
  }
  :global(.slider) {
    width: 50% !important;
    height: 10px !important;
    border-radius: 5px;
  }
  :global(.alpha) {
    width: 50% !important;
    height: 10px !important;
    border-radius: 5px;
  }
  :global(.to-right) {
    border: none !important;
    padding: 0;
  }
</style>
