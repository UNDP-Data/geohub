<script lang="ts">
  import { slide } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'

  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import VectorLegend from './VectorLegend.svelte'

  export let layer: Layer = LayerInitialValues
  export let isLegendPanelVisible = false
</script>

{#if isLegendPanelVisible === true}
  <div transition:slide class="action">
    <div class="header">
      <div class="name">Legend</div>
      <div class="close icon-selected" on:click={() => (isLegendPanelVisible = false)} title="Close">
        <Fa icon={faXmark} size="lg" />
      </div>
    </div>
    <VectorLegend {layer} />
  </div>
{/if}

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';

  .action {
    margin-bottom: 25px;

    .header {
      display: flex;
      justify-content: left;
      align-items: center;
      margin-top: 15px;
      background: #f0f0f0;
      border-radius: 7.5px;
      padding: 2.5px;
      padding-left: 7.5px;
      margin-bottom: 10px;

      @media (prefers-color-scheme: dark) {
        background: #0d1117;
        border-color: #30363d;
        color: white;
      }

      .name {
        width: 100%;
      }

      .close {
        cursor: pointer;
        padding-right: 5px;
      }
    }
  }
</style>
