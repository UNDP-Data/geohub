<script lang="ts">
  import Fa from 'svelte-fa'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'

  export let isLegendPanelVisible = false
</script>

<div
  class={isLegendPanelVisible ? 'icon-selected' : 'icon'}
  on:click={() => (isLegendPanelVisible = !isLegendPanelVisible)}>
  <Fa icon={faPalette} size="1x" />
</div>

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';

  .container {
    margin-right: 6px;
  }

  .icon {
    opacity: 0.5;
    display: inline;
    cursor: pointer;
    margin-right: 10px;

    &:hover {
      opacity: 1;
    }
  }
</style>
