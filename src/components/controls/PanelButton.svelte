<script lang="ts">
  import { clickOutside } from 'svelte-use-click-outside'

  let isPanelOpen = false

  //fontawesome icon name e.g., https://fontawesome.com/search
  export let icon: string
  export let width: string
  export let tooltip: string
  export let position: 'top' | 'bottom' | 'right' | 'left' = 'top'
</script>

<div
  class="panel-control {`${position === 'top' ? '' : `has-tooltip-${position}`}`}"
  data-tooltip={tooltip}
  use:clickOutside={() => (isPanelOpen = false)}>
  <button
    class="button"
    on:click={() => (isPanelOpen = !isPanelOpen)}>
    <span class="icon is-small">
      <i class={icon} />
    </span>
  </button>

  {#if isPanelOpen}
    <div
      class="panel container p-4 mt-1"
      style="width: {width}">
      <slot />
    </div>
  {/if}
</div>

<style lang="scss">
  .panel-control {
    position: relative;
    margin-left: 0.2rem;

    .panel {
      position: absolute;
      background-color: white;
      top: 32.5px;
      right: 0px;
      border: 1px solid gray;
      border-radius: 5px;
      z-index: 10;
    }
  }
</style>
