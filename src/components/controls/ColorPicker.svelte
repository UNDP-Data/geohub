<script lang="ts">
  import { ColorPicker, Color } from 'svelte-colorpick'

  const lineColorPickerSetting = {
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

  export let RgbColor

  const rgb2hex = (rgbColor: string): string => {
    const rgbText = rgbColor.replace('rgb(', '').replace(')', '').replace(' ', '').split(',')
    const rgbValues = []
    rgbText.forEach((val) => {
      rgbValues.push(Number(val.trim()))
    })
    const hex = '#' + ((1 << 24) + (rgbValues[0] << 16) + (rgbValues[1] << 8) + rgbValues[2]).toString(16).slice(1)
    return hex
  }

  let hexColor = Color.hex(rgb2hex(RgbColor))
  $: hexColor, colorToRGB()
  const colorToRGB = () => {
    RgbColor = `rgb(${hexColor.data.r}, ${hexColor.data.g}, ${hexColor.data.b})`
  }
</script>

<div>
  <ColorPicker
    bind:color={hexColor}
    tabbed={lineColorPickerSetting.tabbed}
    selectedTab={lineColorPickerSetting.selectedTab}
    selectedDimension={lineColorPickerSetting.selectedDimension}
    showMatrix={lineColorPickerSetting.showMatrix}
    showSliders={lineColorPickerSetting.showSlidersGlobal && lineColorPickerSetting.showSliders}
    showHex={lineColorPickerSetting.showHex}
    showLabels={lineColorPickerSetting.showLabels}
    showNumeric={lineColorPickerSetting.showNumeric}
    selectDimensions={lineColorPickerSetting.selectDimensions}
    matrixWidth={lineColorPickerSetting.matrixWidth}
    matrixHeight={lineColorPickerSetting.matrixHeight}
    scrollbarHeight={lineColorPickerSetting.scrollbarHeight} />
</div>

<style lang="scss">
</style>
