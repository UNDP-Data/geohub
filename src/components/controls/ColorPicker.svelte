<script lang="ts">
  import { clickOutside } from './clickOutside.js'
  import { tick } from 'svelte'
  import { ColorPicker, Color } from 'svelte-colorpick'

  const ColorPickerSetting = {
    selectedDimension: 'rgb.r',
    tabbed: false,
    selectedTab: 'rgb',
    showMatrix: true,
    showSlidersGlobal: true,
    showHex: true,
    showNumeric: true,
    showLabels: true,
    showSliders: {
      'hsl.h': false,
      'hsl.s': false,
      'hsl.l': false,
      'hcl.h': false,
      'hcl.c': false,
      'hcl.l': false,
      'lab.l': false,
      'lab.a': false,
      'lab.b': false,
      'rgb.r': true,
      'rgb.g': true,
      'rgb.b': true,
    },
    selectDimensions: false,
    matrixWidth: 250,
    matrixHeight: 150,
    scrollbarHeight: 10,
  }

  export let RgbColor = ''

  const rgb2hex = (rgbColor: string): string => {
    const rgbText = rgbColor.replace('rgb(', '').replace(')', '').replace(' ', '').split(',')
    const rgbValues = []
    rgbText.forEach((val) => {
      rgbValues.push(Number(val.trim()))
    })
    const hex = '#' + ((1 << 24) + (rgbValues[0] << 16) + (rgbValues[1] << 8) + rgbValues[2]).toString(16).slice(1)
    return hex
  }

  let hexColor = rgb2hex(RgbColor)
  let hexColorObject = Color.hex(hexColor)
  $: hexColorObject, colorToRGB()
  const colorToRGB = () => {
    RgbColor = `rgb(${Math.round(hexColorObject.data.r)}, ${Math.round(hexColorObject.data.g)}, ${Math.round(
      hexColorObject.data.b,
    )})`
    hexColor = rgb2hex(RgbColor)
  }

  // Keyboard shortcut
  let trigger = 'Escape'
  function handleKeydown(e) {
    if (e.key == trigger) {
      ddActive = false
    }
  }

  let windowHeight
  let top

  let ddActive = false

  let ddHeight = 158
  // ddHeight is initially undefined so we can't get the correct values from binding; that's why we have a default
  // todo render offscreen for .1sec to get the height automatically?

  let inputHeight

  async function toggleDropdown(e) {
    if (e.clientY + inputHeight < ddHeight || windowHeight - ddHeight - inputHeight - e.clientY > 0) {
      top = false
    } else {
      top = true
    }

    ddActive = !ddActive

    await tick()
    if (ddActive) {
      //document.querySelector('.color-block.active').focus();
    }
  }

  function clickOutsideDropdown() {
    ddActive = false
  }

  export let showTextbox = false
</script>

<svelte:window bind:innerHeight={windowHeight} on:keydown={handleKeydown} />

<div class="color-picker-holder">
  <div class="color-picker-inner">
    <button
      bind:clientHeight={inputHeight}
      class="select-color"
      on:click={(e) => toggleDropdown(e)}
      class:fake-focus={ddActive}>
      <div style="display: flex;">
        <div style="background: {hexColor};" class="color-block" />
        <div class="caret" class:top style="margin-right: .2rem;" />
      </div>
    </button>
    {#if showTextbox}
      <input type="text" bind:value={RgbColor} readonly />
    {/if}
  </div>
</div>

{#if ddActive}
  <div
    class:top
    bind:clientHeight={ddHeight}
    class="values-dropdown"
    use:clickOutside
    on:click_outside={clickOutsideDropdown}>
    <ColorPicker
      bind:color={hexColorObject}
      tabbed={ColorPickerSetting.tabbed}
      selectedTab={ColorPickerSetting.selectedTab}
      selectedDimension={ColorPickerSetting.selectedDimension}
      showMatrix={ColorPickerSetting.showMatrix}
      showSliders={ColorPickerSetting.showSlidersGlobal && ColorPickerSetting.showSliders}
      showHex={ColorPickerSetting.showHex}
      showLabels={ColorPickerSetting.showLabels}
      showNumeric={ColorPickerSetting.showNumeric}
      selectDimensions={ColorPickerSetting.selectDimensions}
      matrixWidth={ColorPickerSetting.matrixWidth}
      matrixHeight={ColorPickerSetting.matrixHeight}
      scrollbarHeight={ColorPickerSetting.scrollbarHeight} />
  </div>
{/if}

<style lang="scss">
  .color-picker-holder {
    position: relative;
  }

  .color-picker-inner {
    display: flex;
    height: 35px;
  }

  .select-color {
    border: 1px solid #ccc;
    padding: 3px;
    border-radius: 0.2rem;
    margin-right: 0.4rem;
    background: #fff;
    height: 35px;
  }

  .caret {
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #555;
    position: relative;
    top: 10px;
    margin-left: 4px;
  }

  .caret.top {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid #555;
    border-top: none;
  }

  .color-block {
    border-radius: 0.2rem;
    width: 24px;
    height: 24px;
    line-height: 0;
    font-size: 0;
  }

  .values-dropdown {
    padding: 1rem;
    position: absolute;
    z-index: 9999;
    top: 40px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }

  .values-dropdown.top {
    top: auto;
    bottom: 40px;
  }
</style>
