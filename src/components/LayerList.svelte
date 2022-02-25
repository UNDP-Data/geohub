<script lang="ts">
	import { layerList } from '../stores/stores';
    import Layer from './Layer.svelte';
    import List from '@smui/list';
    

</script>


{#each $layerList as layerCfg}
    <Layer {layerCfg}></Layer>
{/each}

<!-- <List>
    {#each $layerList as layerCfg}
        <Layer {layerCfg}></Layer>
    {/each}

</List> -->
<!-- <Accordion>
    {#each $layerList as layerCfg}
        <Layer {layerCfg}></Layer>
    {/each}

</Accordion> -->


<style>
    .accordion {
        width: 100%;
        max-width: 450px;
        margin: 0 auto;
    }




</style>
