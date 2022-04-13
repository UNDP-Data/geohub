<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'

  export let isOpacityPanelVisible = false
</script>

<Wrapper>
  <div
    class={`container ${isOpacityPanelVisible ? 'icon-selected' : 'icon'}`}
    on:click={() => (isOpacityPanelVisible = !isOpacityPanelVisible)}>
    <Fa icon={faDroplet} size="1x" />
  </div>
  <Tooltip showDelay={0} hideDelay={100} yPos="above">Opacity</Tooltip>
</Wrapper>

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
