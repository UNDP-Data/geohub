<script lang="ts">
  import { initTippy } from '$lib/helper'
  import SdgCard from './SdgCard.svelte'

  const tippy = initTippy()
  let tooltipContent: HTMLElement

  const BASE_ASSEST_URL = '/assets/sdgs'
  let sdgs = [...Array(17)].map((v, i) => i + 1)

  let selectedSDGs: { [key: number]: boolean } = {}

  const handleSDGSelected = (e) => {
    const sdg = e.detail.sdg
    const isSelected = e.detail.isSelected

    selectedSDGs[sdg] = isSelected
  }
</script>

<div
  class="sdgs-select-button"
  use:tippy={{ content: tooltipContent }}>
  <div class="box p-2">
    {#if Object.keys(selectedSDGs).filter((sdg) => selectedSDGs[sdg] === true).length > 0}
      <div class="is-flex is-flex-direction-row is-flex-wrap-wrap">
        {#each Object.keys(selectedSDGs).filter((sdg) => selectedSDGs[sdg] === true) as sdg}
          <SdgCard
            sdg={Number(sdg)}
            isSelectable={false} />
        {/each}
      </div>
    {:else}
      <figure
        class={`image is-48x48`}
        data-testid="icon-figure">
        <img
          src="{BASE_ASSEST_URL}/SDG Wheel_WEB.png"
          alt="SDG Wheel_WEB.png"
          title="SDG Wheel_WEB.png" />
      </figure>
    {/if}
  </div>
</div>

<div
  class="tooltip p-2"
  data-testid="tooltip"
  bind:this={tooltipContent}>
  <div class="grid">
    {#each sdgs as sdg}
      <SdgCard
        bind:sdg
        on:sdgSelected={handleSDGSelected} />
    {/each}
  </div>
</div>

<style lang="scss">
  @import 'tippy.js/dist/tippy.css';
  @import 'tippy.js/themes/light.css';

  .sdgs-select-button {
    width: fit-content;
    cursor: pointer;
  }

  .tooltip {
    max-height: 250px;
    overflow-y: auto;

    .grid {
      display: grid;
      grid-gap: 5px;
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
