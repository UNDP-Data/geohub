<script lang="ts">
  import ColorPicker, { ChromeVariant, type RgbaColor } from 'svelte-awesome-color-picker'
  import { createEventDispatcher } from 'svelte'
  import { clickOutside } from 'svelte-use-click-outside'

  const dispatch = createEventDispatcher()

  export let color: RgbaColor

  const changeColor = () => {
    dispatch('changeColor')
  }

  const handleClose = () => {
    dispatch('closeColorPicker', { index: -1 })
  }

  $: color, changeColor()

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }
</script>

<div
  class="default-color-picker-container"
  data-testid="default-color-picker-container"
  use:clickOutside={handleClose}>
  <div
    role="button"
    class="close is-clickable"
    title="Close Color Picker"
    tabindex="0"
    on:keydown={handleEnterKey}
    on:click={handleClose}>
    <i class="fa-solid fa-xmark fa-sm" />
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
