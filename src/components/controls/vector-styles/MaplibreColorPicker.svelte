<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Ripple from '@smui/ripple'
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
<div
  use:Ripple={{ surface: true }}
  on:click={() => (showToolTip = !showToolTip)}
  style="width: 20px; height: 20px; cursor:pointer; border:1px solid grey; background: {rgba}" />

<style lang="scss">
  @use '@material/image-list/index' as image-list;
</style>
