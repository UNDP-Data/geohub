<script lang="ts">
	
	
	import RasterLayer from './RasterLayer.svelte';
    import VectorLayer from './VectorLayer.svelte';
	import { layerList } from '../stores/stores';
    import Button, { Label } from '@smui/button';
    // import Layer from './Layer.svelte';
    import DynamicLayer from './DynamicLayer.svelte'
    let disabled:boolean = true;
    let open:boolean = false
</script>

<div style="display:flex, align-self:center">
    <Button on:click={() => (open = true)} bind:disabled> 
        <Label>New layer from selection..</Label>
    </Button>
      
</div>

    <DynamicLayer bind:open ></DynamicLayer>


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
        padding: 5!important;
    }


</style>
