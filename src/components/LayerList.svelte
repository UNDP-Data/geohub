<script lang="ts">
  import Button, { Label } from '@smui/button'
  import Fa from 'svelte-fa'
  import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'

  import RasterLayer from './RasterLayer.svelte'
  import VectorLayer from './VectorLayer.svelte'
  import { layerList, dynamicLayers } from '../stores'
  import DynamicLayer from './DynamicLayer.svelte'
  import { LayerTypes, TabNames } from '../lib/constants'

  let disabled = true
  let open = false
</script>

{#if $layerList?.length === 0}
  <ul class="no-data-layers">
    <li class="message">
      <div class="icon">
        <Fa icon={faCircleInfo} size="lg" primaryColor="dodgerblue" />
      </div>
      <div class="text">
        No layers have been selected. Please select a layer from the <strong>{TabNames.LOAD_DATA}</strong> tab.
      </div>
    </li>
  </ul>
{/if}

{#if !disabled && $layerList?.length > 0 && $dynamicLayers.length > 1}
  <div style="display:flex; justify-content:center; flex-direction:row">
    <Button on:click={() => (open = true)}>
      <Label>Merge selected layers</Label>
    </Button>
  </div>

  <DynamicLayer bind:open />
{/if}

{#each $layerList as layer (layer.definition.id)}
  {#if layer.type === LayerTypes.RASTER}
    <RasterLayer {layer} bind:disabled />
  {:else if layer.type === LayerTypes.VECTOR}
    <VectorLayer {layer} />
  {/if}
{/each}

<style type="scss">
  :global(.smui-paper__content) {
    padding: 0px !important;
  }

  ul {
    margin: 0;
    list-style: none;
    padding-left: 1.2rem;
    user-select: none;
    padding-top: 5px;

    li {
      display: flex;
      justify-content: left;
      align-items: center;
      padding: 10px;

      @media (prefers-color-scheme: dark) {
        background: #323234;
        border-color: #30363d;
        color: white;
      }

      .text {
        padding-left: 15px;
      }
    }
  }
</style>
