<script lang="ts">
  import Fa from 'svelte-fa'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'

  export let isOpacityPanelVisible = false
</script>

<div
  class={isOpacityPanelVisible ? 'icon-selected' : 'icon'}
  style="margin-right: 6px;"
  on:click={() => {
    isOpacityPanelVisible = !isOpacityPanelVisible
  }}>
  <Fa icon={faDroplet} size="1x" />
</div>

<style lang="scss">
  .icon {
    opacity: 0.5;
    display: inline;
    cursor: pointer;
    margin-right: 10px;

    &:hover {
      opacity: 1;
    }
  }
  @import '../styles/button-icons-selected.scss';
</style>
