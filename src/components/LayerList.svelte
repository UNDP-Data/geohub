<script lang="ts">
  import Button, { Label } from '@smui/button'
  import Fa from 'svelte-fa/src/fa.svelte'
  import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'

  import RasterLayer from './RasterLayer.svelte'
  import VectorLayer from './VectorLayer.svelte'
  import { layerList } from '../stores'
  import DynamicLayer from './DynamicLayer.svelte'
  import { TabNames } from '../lib/constants'

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
        No layers have been selected. Please select a layer from the <strong>{TabNames.LoadData}</strong> tab.
      </div>
    </li>
  </ul>
{/if}

{#if !disabled && $layerList.length > 1}
  <div style="display:flex; justify-content:center; flex-direction:row">
    <Button on:click={() => (open = true)}>
      <Label>Merge selected layers</Label>
    </Button>
  </div>

  <DynamicLayer bind:open />
{/if}

{#each $layerList as layerConfig (layerConfig.definition.id)}
  {#if layerConfig.type === 'raster'}
    <RasterLayer bind:layerConfig bind:disabled />
  {:else}
    <VectorLayer />
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

      .text {
        padding-left: 15px;
      }
    }
  }
</style>
