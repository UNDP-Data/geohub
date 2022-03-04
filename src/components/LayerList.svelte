<script lang="ts">
	
	
	import RasterLayer from './RasterLayer.svelte';
    import VectorLayer from './VectorLayer.svelte';
	import { dynamicLayers, layerList } from '../stores/stores';
    import Button, { Label } from '@smui/button';
    import DynamicLayer from './DynamicLayer.svelte'
    let disabled:boolean = true;
    let open:boolean = false
    let choices:Array<string> = [];
    let v = '';
    const onClick =  () => {
        open = true;
        console.log('mounting');
        for (const [key, value] of Object.entries($dynamicLayers)) {
                console.log(`KV: ${key}:${value}`);
                if(value && !choices.includes(key)){

                choices.push(key);
                };
                

                console.log(choices);

            }
        v = JSON.stringify(choices);
        console.log('Choices ', v);
  };
  

</script>
{#if !disabled}
    <div style="display:flex; justify-content:center; flex-direction:row">
        <Button on:click={onClick} bind:disabled>
            <Label>Combined layer from selection..</Label>
        </Button>
        
    </div>
    
    <DynamicLayer bind:open choices={choices} ></DynamicLayer>
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
        padding: 5px!important;
    }


</style>
