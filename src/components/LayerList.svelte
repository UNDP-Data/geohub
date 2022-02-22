<script lang="ts">
	import { layerList } from '../stores/stores';
    import Layer from './Layer.svelte';
    import Accordion from '@smui-extra/accordion/src/Accordion.svelte';
    

</script>



<p>
    LayerList
</p>

<Accordion multiple>
    {#each $layerList as layerCfg}

    <Layer {layerCfg}></Layer>
{/each}

</Accordion>

