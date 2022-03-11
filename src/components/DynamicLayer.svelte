<script lang="ts">
  import {map} from '../stores/mapstore';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import {layerList,dynamicLayers} from '../stores/stores';
  import Chip, { Set, TrailingAction, Text } from '@smui/chips';
  import List, { Item, Separator, Text as LText, Meta, Label as LLabel } from '@smui/list';
  import Select, { Option } from '@smui/select';
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import { v4 as uuidv4 } from 'uuid';
  import Calculator from './raster/Calculator.svelte'
  import Slider from '@smui/slider';
  


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
  
  const setLayerExpression = () => {
    
    if (clickedLayer){
      
      console.clear();
      console.log(`setting expression ${expression} ${clickedLayer}`)
      // console.log(`fetching stats for ${clickedLayer}`)
      let inputLayer =  $layerList.filter(item => item.lDef.id === clickedLayer).pop();
      // console.log(JSON.stringify(inputLayer.lDef, null, '\t'));
      // console.log(JSON.stringify(inputLayer.lStats, null, '\t'));

      lMin = Number(Number(inputLayer.lInfo['band_metadata'][0][1]['STATISTICS_MINIMUM']).toFixed(2));
      lMax = Number(Number(inputLayer.lInfo['band_metadata'][0][1]['STATISTICS_MAXIMUM']).toFixed(2));

      lStep  = (lMax-lMin) *1e-2;
      lStep = parseFloat(lStep.toFixed(2));

      lSliderValue = lMin + lStep * 50 ;
      // the computaions below are necessary to set the Range slider
      // console.log(lMin, lMax, lStep, lSliderValue);
      // let factor = 1e2;
      // lSliderProps.min =  Math.round( lMin * factor + Number.EPSILON ) / factor;
      // lSliderProps.max =  Math.round( lMax * factor + Number.EPSILON ) / factor;
      // let range  = lSliderProps.max - lSliderProps.min
      // let start = (range * .25);
      // let end = (range * .75);
      // lSliderProps.step  = (lSliderProps.max-lSliderProps.min ) *1e-2;
      // lSliderProps.end = end + (lSliderProps.max - end) % lSliderProps.step;
      // lSliderProps.start = start- (start - lSliderProps.min) % lSliderProps.step;
      // console.log('AFTER', JSON.stringify(lSliderProps, null, '\t'));
      let inputLayerIdx = $dynamicLayers.indexOf(clickedLayer)+1;
  
      expression += `b${inputLayerIdx}`;

    }
    

  };


  const processSliderClick = () => {
    expression += `${lSliderValue}`;
  }
  
  
  const processCombinedLayer = (action:boolean) => {
    //#TODO: use env var to set the endpoint 
    console.log(`inside processCombinedLayer ${action}`);
    if (action == true){
      let combinedurl:string = '';
      let bounds = []
      $dynamicLayers.forEach((lid, i) => {
        console.log(`processing ${lid}`);
        let inLayer =  $layerList.filter(item => item.lDef.id === lid).pop();
        
        let lSrc = $map.getSource(inLayer.lDef.source);
        let tileurl = lSrc.tiles[0];
        
        let tURL = new URL(tileurl);
        // console.log(tURL);
        
        let lurl = tURL.searchParams.get('url');
        if (combinedurl == ''){
          combinedurl = `${tURL.protocol}/${tURL.host}${decodeURI(tURL.pathname)}?scale=1&TileMatrixSetId=WebMercatorQuad`;
          bounds = lSrc.bounds;
          
        } 
        combinedurl += `&url=${lurl}`
        
        
        
        

      });

      combinedurl += `&unscale=false&resampling=nearest&rescale=0,1&colormap_name=viridis&return_mask=true`

      
      

      //console.log(combinedurl);
      const lSrc = {
                    'type': 'raster',
                    'tiles': [combinedurl],         
                    'tileSize': 256,
                    'bounds':bounds,
                    'attribution':'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
      };

      console.log(JSON.stringify(lSrc));

      const srcID = uuidv4();
      if(! (srcID in $map.getStyle().sources)){
        $map.addSource(srcID,lSrc);
      }
      const lDef = {
                    
                    'id': newLayerId || 'test',
                    'type': 'raster',
                    'source': srcID,
                    'minzoom': 0,
                    'maxzoom': 22,
                    'layout': {
                        'visibility':'visible'
                        
                        },


      };

      layerList.set([{'lName':newLayerName || 'test', 'lDef':lDef, 'lType':'raster', 'lInfo':{}}, ...$layerList ]);
      let firstSymbolId = undefined;
      for (const layer of $map.getStyle().layers) {
          if (layer.type === 'symbol') {
              firstSymbolId = layer.id;
              break;
          }
      }
      
      //console.log(`LL: ${JSON.stringify($layerList, null, '\t')}`);
      $map.addLayer(lDef, firstSymbolId);

    }

    expression = '';
    clickedLayer = undefined;
    

  }


  export let open = false;
  let lMin = 0;
  let lMax=10;
  let lStep = 0;
  let lSliderValue=0;
  
  
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
  

  
  const setClickedLayer = (l) => {
    clickedLayer = l;
    setLayerExpression();
  }


  
  
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
              <Item on:SMUI:action={() => {setClickedLayer(l)}} >
                
                <LText>{lNames[$dynamicLayers.indexOf(l)]}</LText>
                
              </Item>
            {/each}
          </List>

            
        </div>
        
        {#if clickedLayer != undefined}
        <div class="onecol">
        
          <div>{lMin} </div>
          <Slider discrete  bind:value={lSliderValue} min={lMin} max={lMax} step={lStep} style="width:300px" input$aria-label="Layer opacity"/>
          <div>{lMax}</div>
          <div>
            <Button on:click={() => processSliderClick()}>
              <Label>USE</Label>
            </Button>
          </div>
        </div>
        <!-- <div class="expr">
          <pre class="status">Value: {lSliderValue}</pre>
        </div> -->
          <div class='expr'>
            <Calculator bind:expression bind:clickedLayer ></Calculator>
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

.onecol {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  margin: auto;
  border: 1px solid red;
}
</style>
