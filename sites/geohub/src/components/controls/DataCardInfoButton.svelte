<script lang="ts">
  import type { Layer } from '$lib/types'
  import Popper from '$lib/popper'
  import { fade } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'
  import DataCardInfo from '$components/DataView/DataCardInfo.svelte'

  export let layer: Layer = undefined

  let isPopupShown = false

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-start',
      strategy: 'fixed',
    },
    [-25, -5],
  ).init()

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      isPopupShown = !isPopupShown
    }
  }
</script>

<div
  class="icon-selected has-tooltip-bottom"
  title="Toggle Infomation"
  aria-label="Toggle Infomation"
  tabindex="0"
  role="button"
  data-tooltip={`${isPopupShown ? 'Hide infomation' : 'Show infomation'}`}
  use:popperRef
  on:click={() => (isPopupShown = !isPopupShown)}
  on:keydown={handleKeyDown}>
  <i class="fa-solid fa-info-circle sm" />
</div>

{#if isPopupShown}
  <div
    id="tooltip"
    data-testid="tooltip"
    use:popperContent={popperOptions}
    use:clickOutside={() => (isPopupShown = false)}
    transition:fade>
    <div
      class="close"
      alt="Close"
      title="Close"
      on:click={() => (isPopupShown = false)}>
      <i class="fa-solid fa-xmark sm" />
    </div>

    <div class="data-card">
      <DataCardInfo
        bind:feature={layer.dataset}
        bind:metadata={layer.info} />
    </div>

    <div
      id="arrow"
      data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';

  @import '../../styles/popper.scss';
  #tooltip {
    max-width: 300px;
    inset: -10px auto auto 0px !important;

    .close {
      text-align: right;
      z-index: 10;
      cursor: pointer;
    }

    .data-card {
      text-align: justify;
      text-justify: inter-word;
      word-wrap: break-word;
      font-weight: lighter;
      max-height: 300px;
      overflow-y: auto;
    }
  }
</style>
