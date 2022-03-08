<script lang="ts">
	
	
	import RasterLayer from './RasterLayer.svelte';
    import VectorLayer from './VectorLayer.svelte';
	import { dynamicLayers, layerList } from '../stores/stores';
    import Button, { Label } from '@smui/button';
    import DynamicLayer from './DynamicLayer.svelte'
    let disabled:boolean = true;
    let open:boolean = false
    
  

</script>
{#if !disabled}
    <div style="display:flex; justify-content:center; flex-direction:row">
        <Button on:click={() => open = true} bind:disabled>
            <Label>Combined layer from selection..</Label>
        </Button>
        
    </div>
    
    <DynamicLayer bind:open  ></DynamicLayer>
{/if}





{#each $layerList as layerCfg(layerCfg.lDef.id)}
    <!-- <Layer layerCfg={layerCfg}></Layer> -->
    {#if layerCfg.lType === 'raster'}
        <RasterLayer bind:layerCfg bind:disabled></RasterLayer>
    {:else}
        <VectorLayer></VectorLayer>
    {/if}
{/each}



<style>
    
    :global(.smui-paper__content){
        padding: 0px!important;
    }


</style>
