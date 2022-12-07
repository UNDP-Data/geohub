<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let isIconButton = false
  export let title = ''

  const handleClicked = () => {
    dispatch('clicked')
  }
</script>

{#if isIconButton}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span
    class="button-icon fa-stack fa-xl"
    role="button"
    tabindex="0"
    on:click={handleClicked}>
    <i class="fa-solid fa-layer-group fa-stack-xl" />
    <i class="fab fa-plus fa-sm fa-stack-1x" />
  </span>
{:else}
  <!-- svelte-ignore a11y-missing-attribute -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <a
    class="button button-primary button-without-arrow"
    role="button"
    on:click={handleClicked}>
    {title}
  </a>
{/if}

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/buttons.min.css';

  .button {
    color: white !important;
    width: 100%;
  }

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
