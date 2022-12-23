<script lang="ts">
  import { fade } from 'svelte/transition'
  import { clickOutside } from 'svelte-use-click-outside'
  import Popper from '$lib/popper'

  let isPanelOpen = false

  //fontawesome icon name e.g., https://fontawesome.com/search
  export let icon: string
  export let iconDisabled = ''
  export let width: string
  export let tooltip: string
  export let position: 'top' | 'bottom' | 'right' | 'left' = 'top'
  export let disabled = false
  export let popupPoistion = 'bottom-end'

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: popupPoistion,
      strategy: 'fixed',
    },
    [0, 3],
  ).init()
</script>

<div
  class="panel-control has-tooltip-arrow {`${position === 'top' ? '' : `has-tooltip-${position}`}`}"
  data-tooltip={tooltip}
  use:popperRef
  use:clickOutside={() => (isPanelOpen = false)}>
  <button
    class="button"
    {disabled}
    on:click={() => (isPanelOpen = !isPanelOpen)}>
    <span class="icon is-small">
      <i class={disabled && iconDisabled ? iconDisabled : icon} />
    </span>
  </button>

  {#if isPanelOpen}
    <div
      id="tooltip"
      data-testid="tooltip"
      style="max-width: {width}"
      use:popperContent={popperOptions}
      use:clickOutside={() => (isPanelOpen = false)}
      transition:fade>
      <div
        class="panel container p-4"
        style="width: {width}">
        <slot />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @import '../../styles/popper.scss';

  .panel-control {
    position: relative;
    margin-left: 0.2rem;

    .panel {
      cursor: default;
    }
  }

  #tooltip {
    background-color: white;
    margin: 0;
    padding: 0;
    z-index: 20;
  }
</style>
