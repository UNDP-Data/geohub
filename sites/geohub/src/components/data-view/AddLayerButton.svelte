<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Button } from '@undp-data/svelte-undp-design'
  const dispatch = createEventDispatcher()

  export let isIconButton = false
  export let title = ''

  const handleClicked = () => {
    dispatch('clicked')
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      dispatch('clicked')
    }
  }
</script>

{#if isIconButton}
  <span
    class="button-icon fa-stack fa-xl"
    role="button"
    tabindex="0"
    on:keydown={handleKeyDown}
    on:click={handleClicked}>
    <i class="fa-solid fa-layer-group fa-stack-xl" />
    <i class="fab fa-plus fa-sm fa-stack-1x" />
  </span>
{:else}
  <Button
    {title}
    on:clicked={handleClicked} />
{/if}

<style lang="scss">
  .button-icon {
    width: 30px;
    height: 30px;

    .fa-stack-1x {
      width: auto;
      height: auto;
      top: -13px;
      right: -10px;
      color: d12800;
    }
    color: #d12800;
  }
</style>
