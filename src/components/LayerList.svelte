<script lang="ts">
	import { layerList } from '../stores/stores';
    import Layer from './Layer.svelte';
    

</script>


{#each $layerList as layerCfg(layerCfg.lDef.id)}
    <Layer layerCfg={layerCfg}></Layer>
{/each}



<style>
    



</style>
