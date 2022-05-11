<script lang="ts">
  import { ColorPicker, Color } from 'svelte-colorpick'
  import { createEventDispatcher } from 'svelte'

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
      'hcl.h': true,
      'hcl.c': false,
      'hcl.l': false,
      'lab.l': false,
      'lab.a': false,
      'lab.b': false,
      'rgb.r': false,
      'rgb.g': false,
      'rgb.b': false,
    },
    selectDimensions: false,
    matrixWidth: 250,
    matrixHeight: 150,
    scrollbarHeight: 10,
  }

  export let collapse = true
  export let color
  export let position
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

  const colorToRGB = () => {
    RgbColor = `rgb(${Math.round(hexColorObject.data.r)}, ${Math.round(hexColorObject.data.g)}, ${Math.round(
      hexColorObject.data.b,
    )})`
    hexColor = rgb2hex(RgbColor)
  }

  const generateHex = () => {
    if (color) {
      RgbColor = `rgb(${color.join()})`
    }
    hexColor = rgb2hex(RgbColor)
    hexColorObject = Color.hex(hexColor)
  }

  let hexColor = rgb2hex(RgbColor)
  let hexColorObject = Color.hex(hexColor)

  $: color, generateHex()
  $: hexColorObject, changeColor()
  $: hexColorObject, colorToRGB()
  $: hexColorObject, getIndex()

  const dispatch = createEventDispatcher()

  function changeColor() {
    dispatch('changeColor', {
      color: hexColorObject,
      position: position,
    })
  }

  function getIndex() {
    dispatch('getIndex', {})
  }
</script>

<div>
  <ColorPicker
    bind:color={hexColorObject}
    {collapse}
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

<style lang="scss">
</style>
