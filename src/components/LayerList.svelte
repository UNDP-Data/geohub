<script lang="ts">
	
	
	import RasterLayer from './RasterLayer.svelte';
    import VectorLayer from './VectorLayer.svelte';
	import { layerList } from '../stores/stores';
    // import Layer from './Layer.svelte';
    import DynamicLayer from './DynamicLayer.svelte'
    let showDynamicButton:boolean = false;
</script>
{#if showDynamicButton}
    <DynamicLayer></DynamicLayer>
{/if}

{#each $layerList as layerCfg(layerCfg.lDef.id)}
    <!-- <Layer layerCfg={layerCfg}></Layer> -->
    {#if layerCfg.lType === 'raster'}
        <RasterLayer bind:layerCfg bind:showDynamicButton></RasterLayer>
    {:else}
        <VectorLayer></VectorLayer>
    {/if}
{/each}



<style>
    
    :global(.smui-paper__content){
        padding: 5!important;
    }


</style>
