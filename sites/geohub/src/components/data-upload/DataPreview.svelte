<script lang="ts">
  import MiniMap from '$components/data-view/MiniMap.svelte'
  import { initTippy } from '$lib/helper'
  import type { DatasetFeature } from '$lib/types'
  import { CtaLink } from '@undp-data/svelte-undp-design'

  let isLoadMap = false

  const tippy = initTippy({
    placement: 'bottom',
    maxWidth: 400,
    onShow(instance) {
      isLoadMap = true
      instance.popper.querySelector('.close')?.addEventListener('click', () => {
        instance.hide()
      })
    },
  })
  let tooltipContent: HTMLElement

  export let id: string
  export let url: string
  export let size: 'is-small' | 'is-normal' | 'is-medium' | 'is-large' = 'is-small'
  export let disabled = false
  export let feature: DatasetFeature = undefined

  let isPmtiles = url.indexOf('.pmtiles') !== -1 ? true : false

  if (!feature) {
    // if no feature is given, create feature object with minimum property
    feature = {
      type: 'Feature',
      properties: {
        id,
        url: isPmtiles ? `pmtiles://${url}` : url,
        is_raster: isPmtiles,
      },
    }
  }

  const handleLinkClicked = () => {
    const viewerUrl = `https://undp-data.github.io/PMTiles?url=${encodeURIComponent(url)}`
    window.open(viewerUrl, '_blank')
  }
</script>

<button
  class="button is-primary table-button {size}"
  type="button"
  {disabled}
  use:tippy={{ content: tooltipContent }}>
  <span class="icon">
    <i class="fa-solid fa-map" />
  </span>
  <span>Preview</span>
</button>

<div
  bind:this={tooltipContent}
  class="tooltip p-2">
  <MiniMap
    bind:feature
    bind:isLoadMap
    width="370px"
    height="250px" />

  {#if isPmtiles}
    <div class="mt-2">
      <CtaLink
        label="See more details"
        isArrow={false}
        on:clicked={handleLinkClicked} />
    </div>
  {/if}
</div>

<style lang="scss">
  @import 'tippy.js/dist/tippy.css';
  @import 'tippy.js/themes/light.css';

  .tooltip {
    // font-size: 13px;
    z-index: 10;
    width: 400px;
  }
</style>
