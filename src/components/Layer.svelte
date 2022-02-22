<script lang="ts">
    import List, { Item, Meta, Label } from '@smui/list';
    import { Accordion, AccordionItem, CollapsibleCard } from 'svelte-collapsible'
    import Checkbox from '@smui/checkbox';
    import Switch from '@smui/switch';
    import FormField from '@smui/form-field';

    import {map} from '../stores/mapstore'
    import List from '@smui/list/src/List.svelte';

    
    export let layerCfg;
    export let lName, lSrc, lDef;
    $: ({lName, lSrc, lDef} = layerCfg);
    $:mmap = $map;
    let selected:boolean = false;

    const handleChange = () => {
        const srcId = lDef.source;
        const lId = lDef.id;

        if (selected) {
            
            $map.addSource(srcId,lSrc);
            $map.addLayer(lDef);


        } else{
            $map.removeLayer(lId);
            $map.removeSource(srcId);

        }

    };
    

</script>

<CollapsibleCard>
	<h5 slot='header' class='header'>{lName}</h5>
	<div slot='body' class='body'>
		<Checkbox bind:checked={selected} value="{lDef.lid}" on:change={handleChange} />
    </div>
</CollapsibleCard>

<!-- <AccordionItem key={lDef.lid}>
    <h5 slot='header'>{lName} </h5>
    <div slot='body'>
       
    </div> 
</AccordionItem> -->
<!-- <Item>
    <Label>{lName}</Label>
      <Meta>
        <Checkbox bind:checked={selected} value="{lDef.lid}" on:change={handleChange} />
    </Meta>
    
</Item> -->


<style>
    .accordion-item {
		border-bottom: 1px solid rgb(100, 120, 140);
	}
    .header {
		display: flex;
		align-items: center;
		padding: 0.5em;
	}
	
	.header h {
		margin: 0;
		padding: 0;
	}
	
	.header p {
		font-size: 18px;
		margin: 0;
	}
	
	.body {
		padding: 0.5em;
		margin: 0;
		font-size: 18px;
	}
</style>