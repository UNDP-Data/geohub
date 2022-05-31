<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'
  import { createPopperActions } from 'svelte-popperjs'

  import DefaultColorPicker from '$components/DefaultColorPicker.svelte'
  import type { Color } from '$lib/types'

  const dispatch = createEventDispatcher()

  export let rgba = `rgba(0,0,0,1)`

  let color: Color = {
    r: chroma(rgba).rgba()[0],
    g: chroma(rgba).rgba()[1],
    b: chroma(rgba).rgba()[2],
    a: chroma(rgba).rgba()[3],
    hex: chroma(rgba).hex('rgb'),
    h: isNaN(chroma(rgba).hsv()[0]) ? 0 : chroma(rgba).hsv()[0],
    s: chroma(rgba).hsv()[1],
    v: chroma(rgba).hsv()[2],
  }

  let showToolTip = false

  const setColor = () => {
    rgba = `rgba(${color.r},${color.g},${color.b},${color.a})`
    dispatch('change', {
      color: rgba,
    })
  }

  const [popperRef, popperContent] = createPopperActions({
    placement: 'right-end',
    strategy: 'fixed',
  })

  const popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [10, 25],
        },
      },
    ],
  }
</script>

<div class="color-palette" on:click={() => (showToolTip = !showToolTip)} style="background: {rgba};" use:popperRef />
{#if showToolTip}
  <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
    <DefaultColorPicker bind:color on:closeColorPicker={() => (showToolTip = false)} on:changeColor={setColor} />
    <div id="arrow" data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  .color-palette {
    border: 1px solid hsl(0, 0%, 0%);
    cursor: pointer;
    height: 20px;
    padding: 1px;
    width: 20px;

    @media (prefers-color-scheme: dark) {
      border: 1px solid hsl(0, 0%, 100%);
    }

    &:hover {
      border: 1px solid hsl(204, 86%, 53%);
      padding: 0;
    }
  }

  $tooltip-background: #fff;

  #tooltip {
    background: $tooltip-background;
    border-radius: 7.5px;
    border: 1px solid #ccc;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    font-size: 13px;
    height: 230px;
    inset: auto auto 0px -10px !important;
    position: relative;
    width: 170px;
    z-index: 100;

    @media (prefers-color-scheme: dark) {
      background: #212125;
    }

    #arrow,
    #arrow::before {
      background: $tooltip-background;
      height: 18px;
      left: -4.5px;
      position: absolute;
      width: 18px;

      @media (prefers-color-scheme: dark) {
        background: #212125;
      }
    }

    #arrow {
      visibility: visible;
    }

    #arrow::before {
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
      content: '';
      transform: rotate(45deg);
      visibility: visible;
    }
  }
</style>
