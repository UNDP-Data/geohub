<script lang="ts">
  import { initTippy } from '$lib/helper'

  const tippy = initTippy()
  let tooltipContent: HTMLElement

  const BASE_ASSEST_URL = '/assets/sdgs'
  let sdgs = [...Array(17)].map((v, i) => i + 1)

  let selectedSDGs: { [key: number]: boolean } = {}

  const handleSDGSelected = (goal: number) => {
    // const index = selectedSDGs.indexOf(goal)
    if (selectedSDGs[goal] && selectedSDGs[goal] === true) {
      selectedSDGs[goal] = false
    } else {
      selectedSDGs[goal] = true
    }
  }

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }
</script>

<div
  class="sdgs-select-button"
  use:tippy={{ content: tooltipContent }}>
  <div class="box p-2">
    <figure
      class={`image is-48x48`}
      data-testid="icon-figure">
      <img
        src="{BASE_ASSEST_URL}/SDG Wheel_WEB.png"
        alt="SDG Wheel_WEB.png"
        title="SDG Wheel_WEB.png" />
    </figure>
  </div>
</div>

<div
  class="tooltip p-2"
  data-testid="tooltip"
  bind:this={tooltipContent}>
  <div class="grid">
    {#each sdgs as sdg}
      <div
        class="sdg-button"
        on:click={() => {
          handleSDGSelected(sdg)
        }}
        on:keydown={handleEnterKey}>
        <figure
          class={`sdg image is-64x64`}
          data-testid="icon-figure">
          <img
            src="{BASE_ASSEST_URL}/{sdg}.png"
            alt="SDG {sdg}"
            title="SDG {sdg}" />

          {#if selectedSDGs[sdg] && selectedSDGs[sdg] === true}
            <div
              class="selected"
              title="Colormap Selected">
              <i class="fa-solid fa-circle-check has-text-success-light" />
            </div>
          {/if}
        </figure>
      </div>
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
    .sdg-button {
      cursor: pointer;
      position: relative;

      :hover {
        border: 2px solid rgb(60, 255, 0);
      }

      .selected {
        // color: hsl(141, 53%, 53%);
        position: absolute;
        right: 3px;
        bottom: 3px;
      }
    }

    .grid {
      display: grid;
      grid-gap: 5px;
      grid-template-columns: repeat(4, 1fr);
    }

    .selected {
      //   color: hsl(141, 53%, 53%);
      position: absolute;
      right: 2px;
      top: 1.5px;
    }
  }
</style>
