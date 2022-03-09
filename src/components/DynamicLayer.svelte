<script lang="ts">

  import {map} from '../stores/mapstore';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import {layerList,dynamicLayers} from '../stores/stores';
  import Chip, { Set, TrailingAction, Text } from '@smui/chips';
  import Paper, { Title as PTitle, Subtitle, Content as PContent } from '@smui/paper';
  import List, { Item, Separator, Text as LText, Meta, Label as LLabel } from '@smui/list';
  import Select, { Option } from '@smui/select';
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import { v4 as uuidv4 } from 'uuid';
  import Calculator from './raster/Calculator.svelte'


  let lNames;
  let expression:string = '';

  const initialize = () => {
    
    lNames = $layerList.filter(item => {
      return $dynamicLayers.includes(item.lDef.id); 
    }).map(item => {
      return item.lName;
    });
    

    //$dynamicLayers.map(item=> {expression[item] = ''});
    // console.log(`expr ${JSON.stringify(expression)}`);
  };


  const fetchLayerStats = () =>  {

    console.log('legend type change');

  };
  
  const setCombinedExpression = () => {
    if (clickedLayer != undefined){
      
       
      console.log(`setting expression ${expression}`)
      console.log(`fetching stats for ${clickedLayer}`)
      let inputLayer =  $layerList.filter(item => item.lDef.id === clickedLayer).pop();
      let inputLayerIdx = $layerList.indexOf(inputLayer)+1;
    
      // console.log(`fetching stats for ${JSON.stringify(inputLayer.lDef.source)}`);
      // let inputLayerSource = $map.getSource(inputLayer.lDef.source);
      // console.log(`fetching stats for ${inputLayerSource}`)
     expression += `b${inputLayerIdx}`

    }
    

  };


  const processCombinedLayer = (action:boolean) => {
    
    console.log(`inside processCombinedLayer ${action}`);

    expression = '';

  }


  export let open = false;

  
  $: open, initialize();
  
  let selectedRes = 'highest';
  let resChoices = ['highest', 'lowest', 'average']

  
 
  let legendTypes = ['continuous', 'bucketed'];
  let selectedLegendType = '';


  let newLayerName = '';
  let newLayerId;
  $: if (newLayerName != '') {
		newLayerId = uuidv4();
	}

  
  let clickedLayer:any = undefined;
  let clickedLayerIndex = undefined;
  $:clickedLayer, setCombinedExpression();

  


  
  
</script>

<Dialog
  bind:open
  aria-labelledby="large-scroll-title"
  aria-describedby="large-scroll-content"
  surface$style="width: 600px; max-width: calc(100vw - 32px);">

  <Title id="large-scroll-title">Create a new combined/dynamic layer</Title>
  <Content >

      <div class="wrapper">
        <div>
          <Textfield variant="filled" bind:value={newLayerName} label="Layer name">
            <HelperText slot="helper">...set the name of the new layer ...</HelperText>
          </Textfield>
          {#if newLayerName}
             <span class="lid">ID: {newLayerId}</span>
          {/if}
        </div>
        <div>

          <!-- <Select bind:value={clickedLayer} label="Define layer">
            {#each $dynamicLayers as l}
              <Option value={l}>{lNames[$dynamicLayers.indexOf(l)]}</Option>
            {/each}
          </Select> -->

          <List style="max-width:300px">
            {#each $dynamicLayers as l }
              <Item on:SMUI:action={() => (clickedLayer = l)} >
                
                <LText>{lNames[$dynamicLayers.indexOf(l)]}</LText>
                
              </Item>
            {/each}
          </List>

            
        </div>
        {#if clickedLayer != undefined}
          <div class='expr'>
            <Calculator bind:expression bind:clickedLayer></Calculator>
          </div>   
        {/if}
        
        
        <div >

            <Select bind:value={selectedLegendType} label="Select legend type">
              {#each legendTypes as legendType}
                <Option value={legendType}>{legendType}</Option>
              {/each}
            </Select>
          
        </div>
        
        <div>
          <Set chips={resChoices} let:chip choice bind:selected={selectedRes}>
            <Chip {chip} touch>
              <Text>{chip}</Text>
            </Chip>
          </Set>
        </div>


        {#if expression != ''}
           <div class="expr">
             {@html expression}
            <!-- {#each Object.entries(expression) as [lname, lexpr]}
              {lname} - {lexpr}
            {/each}  -->

          </div>
        {/if}
        
    
    
        

      </div>

      
        
        

    


  </Content>
  <Actions>
    <Button on:click={() => processCombinedLayer(true)}>
      <Label>Create</Label>
    </Button>
    <Button on:click={() => processCombinedLayer(false)}>
      <Label>Cancel</Label>
    </Button>
  </Actions>
</Dialog>
 

<!-- <Paper variant="outlined">
    <PTitle>Outlined Paper</PTitle>
    <Subtitle>This is an outlined sheet of paper.</Subtitle>
    <PContent><span>We have {$dynamicLayers.length} layers</span></PContent>
</Paper> -->
<style>
  .wrapper {
  border: 0px solid;
  display: grid;
  grid-template-rows: repeat(-1, minmax(0, 1fr));
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px 5px;
  align-items: center;
  justify-items: center;
  
}
.wrapper > div {
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
  border: 0px solid blue;
  align-items: stretch ;
  grid-auto-rows: 1fr;
  
}
.expr {
  grid-column: 1/-1;
  border: 1px solid red;

}
.lid  {
  font-family: Roboto,serif;
  font-size: 8pt;
}

</style>
