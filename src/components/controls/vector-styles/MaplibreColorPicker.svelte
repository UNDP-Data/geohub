<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import chroma from 'chroma-js'

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
</script>

{#if showToolTip}
  <div class={showToolTip ? 'tooltipshown' : 'tooltiphidden'}>
    <DefaultColorPicker bind:color on:closeColorPicker={() => (showToolTip = false)} on:changeColor={setColor} />
  </div>
{/if}
<div class="color-palette" on:click={() => (showToolTip = !showToolTip)} style="background: {rgba};" />

<style lang="scss">
  .color-palette {
    width: 20px;
    height: 20px;
    padding: 1px;
    cursor: pointer;

    &:hover {
      padding: 0;
      border: 1px solid hsl(204, 86%, 53%);
    }
  }
</style>
