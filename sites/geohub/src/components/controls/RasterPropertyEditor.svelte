<script lang="ts">
  import { map } from '$stores'
  import { initTippy } from '$lib/helper'
  import RasterBrightnessMax from './raster-styles/RasterBrightnessMax.svelte'
  import RasterContrast from './raster-styles/RasterContrast.svelte'
  import RasterHueRotate from './raster-styles/RasterHueRotate.svelte'
  import RasterResampling from './raster-styles/RasterResampling.svelte'
  import RasterSaturation from './raster-styles/RasterSaturation.svelte'

  export let layerId: string

  const tippy = initTippy({
    appendTo: document.body,
    placement: 'right',
    maxWidth: 350,
  })
  let tooltipContent: HTMLElement

  const handleEnterKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.target.click()
    }
  }
</script>

<button
  class="editor-button button is-primary is-normal"
  use:tippy={{ content: tooltipContent }}>
  <span class="icon is-small">
    <i class="fa-solid fa-palette fa-lg" />
  </span>
</button>

<div
  bind:this={tooltipContent}
  class="tooltip p-2">
  <span
    class="close icon"
    on:keydown={handleEnterKey}>
    <i
      class="fa-solid fa-circle-xmark fa-2x"
      style="color:#1c1c1c;" />
  </span>

  <p class="title is-4">Raster settings</p>

  <div class="controls-container">
    <div class="field">
      <label class="label is-normal"> Brightness max </label>
      <div class="control">
        <RasterBrightnessMax
          bind:map={$map}
          bind:layerId />
      </div>
      <p class="help is-link is-size-6">Increase or reduce the maximum brightness of the image</p>
    </div>

    <div class="field">
      <label class="label is-normal"> Brightness min </label>
      <div class="control">
        <RasterBrightnessMax
          bind:map={$map}
          bind:layerId />
      </div>
      <p class="help is-link is-size-6">Increase or reduce the minimum brightness of the image</p>
    </div>

    <div class="field">
      <label class="label is-normal"> Contrast </label>
      <div class="control">
        <RasterContrast
          bind:map={$map}
          bind:layerId />
      </div>
      <p class="help is-link is-size-6">Increase or reduce the contrast of the image</p>
    </div>

    <div class="field">
      <label class="label is-normal"> Hue rotate </label>
      <div class="control">
        <RasterHueRotate
          bind:map={$map}
          bind:layerId />
      </div>
      <p class="help is-link is-size-6">Rotates hues around the color wheel</p>
    </div>

    <div class="field">
      <label class="label is-normal"> Resampling </label>
      <div class="control">
        <RasterResampling
          bind:map={$map}
          bind:layerId />
      </div>
      <p class="help is-link is-size-6">The resampling/interpolation method to use for overscaling</p>
    </div>

    <div class="field">
      <label class="label is-normal"> Saturation </label>
      <div class="control">
        <RasterSaturation
          bind:map={$map}
          bind:layerId />
      </div>
      <p class="help is-link is-size-6">Increase or reduce the saturation of the image</p>
    </div>
  </div>
</div>

<style lang="scss">
  @import 'tippy.js/dist/tippy.css';
  @import 'tippy.js/themes/light.css';

  .editor-button {
    cursor: pointer;
  }

  .tooltip {
    font-size: 13px;
    z-index: 10;
    width: 260px;

    .close {
      position: absolute;
      top: 0.5rem;
      right: 0.6rem !important;
      cursor: pointer;
      z-index: 5;
    }

    .controls-container {
      max-height: 80vh;
      overflow-y: auto;
    }
  }
</style>
