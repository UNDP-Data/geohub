<script lang="ts">
    import List, { Item, Meta, Label } from '@smui/list';
    import { Panel, Header as AccHeader, Content as AccContent } from '@smui-extra/accordion';
    import Checkbox from '@smui/checkbox';
    import Switch from '@smui/switch';
    import FormField from '@smui/form-field';

    import {map} from '../stores/mapstore'
    
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

<!-- <Item>
    <Label>{lName}</Label>
      <Meta>
        <Checkbox bind:checked={selected} value="{lDef.lid}" on:change={handleChange} />
        </Meta>
</Item> -->

<Panel color="primary" square>
    <AccHeader>{lName}</AccHeader>
    <AccContent>
        <FormField>
            <Checkbox bind:checked={selected} value="{lDef.lid}" on:change={handleChange} />
            <span slot="label">ON/OFF</span>
        </FormField>
            
         <span slot="label">{lName}</span>
        <!-- <FormField align="end">
            <Switch bind:checked={selected} on:change={handleChange} />
            
        </FormField> -->
                
        
    </AccContent>
  </Panel>