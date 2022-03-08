<script lang="ts" context="module">
    const _layerState = {
        /* treeNodeId: expanded <boolean> */
    };
    const _sectionState = {
        /* treeNodeId: expanded <boolean> */
    };

    const _dynamicLayerState = {
        /* treeNodeId: expanded <boolean> */
    };

</script>
<script lang="ts">
	
    import {map} from '../stores/mapstore';
    import {layerList, dynamicLayers} from '../stores/stores';
    import IconButton, { Icon } from '@smui/icon-button';
    import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
    import Tooltip, {Wrapper,Content as TooltipContent,Link,RichActions} from '@smui/tooltip';
    import Badge from '@smui-extra/badge';
    import Slider from '@smui/slider';
    import Checkbox from '@smui/checkbox';
	

    export let layerCfg;
    let lName,  lDef, lType;
    ({lName,lDef,lType} = layerCfg);
    
    const srcId = lDef.source;
    const layerId = lDef.id;
    //layera re turned on by default so the active visibility icons should be OFF
    let visSelected = false;
    $: visibility = visSelected ? 'visible' : 'none';

    let queryEnabled:boolean = true;

    export let activeSection:string = _sectionState[layerId] || '';
    let layerOpacity = 1;
    export let panelOpen:boolean = _layerState[layerId] || false;
    export let inDynamic:boolean = _dynamicLayerState[layerId] || false

    const toggleVisibility = () => {

        if (! $map.getLayer(layerId)){
            $map.addLayer(lDef);
        }
        $map.setLayoutProperty(layerId, 'visibility', visibility);
    };

    const removeLayer = () => {
        $map.removeLayer(layerId);
        //TODO remove the layer source as well if none of the layers reference it
        $layerList  = $layerList.filter((item) => item.lDef.id !== layerId );
        //$dynamicLayers  = $dynamicLayers.filter((item) => item !== layerId );
        
        //update dynamic
        inDynamic = false;
        setDynamicLayerState();
        
        //update state vars

        delete _layerState[layerId];
        delete _sectionState[layerId];
        delete _dynamicLayerState[layerId];
        


    };

    const setLayerOpacity = () => {
            
            $map.setPaintProperty(layerId,'raster-opacity',layerOpacity);
    };
    
    const setLayerState = () => {
        
        
        // console.log(` before ${layerId} ${panelOpen} ${JSON.stringify(_layerState)}`);
        
        _layerState[layerId] = panelOpen;
        
        

    };

    const setSectionState = () => {
        
        
        // console.log(` before ${layerId} ${activeSection} ${JSON.stringify(_sectionState)}`);
        
        _sectionState[layerId] = activeSection;
        
        // console.log(`after ${layerId} ${activeSection} ${JSON.stringify(_sectionState)}`);

    };

    export let disabled;

    const setDynamicLayerState = () => {
        _dynamicLayerState[layerId] = inDynamic;
        //console.log(JSON.stringify(_dynamicLayerState), );
        if (inDynamic){
            dynamicLayers.set([...$dynamicLayers, layerId]);
        }else{
            $dynamicLayers  = $dynamicLayers.filter((item) => item !== layerId );
        }
        
        console.log('DLL', JSON.stringify($dynamicLayers), );
        let ntrue = 0;
        for (const [key, value] of Object.entries(_dynamicLayerState)) {
            // console.log(`${key}:${value}`);
            if(value){
                ++ntrue;
            };
            if (ntrue>=2){
                disabled = false;
                break;
            } else{
                disabled = true;
            }

            // console.log(`${key}:${value} ${ntrue}`);

        }

    }

    $: layerOpacity, setLayerOpacity();
    
    

    $: panelOpen, setLayerState();
    $: panelOpen = _layerState[layerId] || false;
    $: activeSection, setSectionState();
    $: activeSection = _sectionState[layerId] || '';


    $: inDynamic, setDynamicLayerState();
    $: inDynamic = _dynamicLayerState[layerId] || false;




    // Set initial state of the selected variable and the selected layers ids Array
    let added : boolean = true;
    let selectedLayersIds = [];
    console.log("Added==", added)
    console.log("Selected Layer List====", selectedLayersIds)


    let allLayers = $map.getStyle().layers
    let layer = allLayers.filter((item) => item.id == layerId).pop()
    let index = allLayers.indexOf(layer)
    let len = allLayers.length

    const hierachyDown = (layerID) => {
        const newIndex = index - 1

        if(newIndex<0){
        }

        else{
            $map.moveLayer(layerID, allLayers[newIndex].id)
            index = newIndex
            $map.triggerRepaint();
        }
    };



    const hierachyUp = (layerID) => {
        const newIndex = index + 1

        if(newIndex>allLayers.length-1){
        }
        else{
            $map.moveLayer(layerID, allLayers[newIndex].id)
            index = newIndex
            $map.triggerRepaint();
        }
    };

</script>


<Accordion >
    <Panel variant='unelevated' color="white" bind:open={panelOpen}>
        <div class="layer-header" >
            <div class="layer-header-name">
                <Header>
                    <span class="layer-name">{lName}<Badge position="inset" align="bottom-end"  aria-label="unread count">{index}/{len}</Badge></span>
                </Header>
            </div>
            <div class="layer-header-icons">
                <Wrapper>
                    <IconButton size="mini" on:click={() => toggleVisibility()} toggle bind:pressed={visSelected} >
                        <Icon class="material-icons">visibility_off</Icon>
                        <Icon color="primary" class="material-icons" on>visibility</Icon>
                    </IconButton>
                    <Tooltip  >
                      <TooltipContent>
                        Toggle visibility
                      </TooltipContent>
                    </Tooltip>
                </Wrapper>

                <Wrapper >
                    <IconButton size="mini" class="material-icons" on:click={() => removeLayer()} >delete</IconButton>
                    <Tooltip  >
                      <TooltipContent>
                        Remove layer from list
                      </TooltipContent>
                    </Tooltip>
                </Wrapper>
                <Checkbox bind:checked={inDynamic} />
            </div>
            
                
        </div>
        <Content>
            
                <div style="display:flex; justify-content: center; border-bottom:1px solid;">
                    <Wrapper>
                        <IconButton size="mini" class="material-icons" on:click={() => {activeSection="color"}}>palette</IconButton>
                        <Tooltip  >
                          <TooltipContent>
                            Set layer color
                          </TooltipContent>
                        </Tooltip>
                    </Wrapper>
                    
                    
                    <Wrapper>
                        <IconButton size="mini" class="material-icons" on:click={() => {activeSection="band"}} >legend_toggle</IconButton>
                        <Tooltip  >
                          <TooltipContent>
                            Define/filter layer
                          </TooltipContent>
                        </Tooltip>
                    </Wrapper>
                    
                    <Wrapper>
                        <IconButton size="mini" class="material-icons" on:click={() => {activeSection="opacity"}}>opacity</IconButton>
                        <Tooltip >
                          <TooltipContent>
                            Set layer opacity/transparency
                          </TooltipContent>
                        </Tooltip>
                    </Wrapper>

                    <Wrapper  >
                        <IconButton size="mini"  toggle bind:pressed={queryEnabled} >
                            <Icon class="material-icons">indeterminate_check_box</Icon>
                            <Icon color="primary" class="material-icons" on>check_box</Icon>
                        </IconButton>
                        <Tooltip color="primary" >
                          <TooltipContent>
                            Turn querying ON/OFF
                          </TooltipContent>
                        </Tooltip>
                    </Wrapper>
                    <Wrapper>
                        <IconButton size="mini" class="material-icons" on:click="{() => {hierachyUp(layerId)}}">keyboard_double_arrow_up
                        </IconButton>
                        <Tooltip color="primary" >
                            <TooltipContent>
                                Promote Layer
                            </TooltipContent>
                        </Tooltip>
                    </Wrapper>
                    <Wrapper>
                        <IconButton size="mini" class="material-icons" on:click="{() => {hierachyDown(layerId)}}">keyboard_double_arrow_down
                        </IconButton>
                        <Tooltip color="primary" >
                            <TooltipContent>
                                Demote Layer
                            </TooltipContent>
                        </Tooltip>
                    </Wrapper>
                </div>

            {#if activeSection === 'color'}
                 <p>Color</p>
            {:else if activeSection === 'band'}
                <p>B</p>
                 
            {:else if activeSection === 'opacity'}
                <div class="layer-header">
                    <div>Opacity:</div>
                    <div class="layer-header-name"><Slider bind:value={layerOpacity} min={0} max={1} step={0.01} input$aria-label="Layer opacity"/></div>
                    <!-- <div>{layerOpacity}</div> -->
                    <!-- <Slider on:SMUISlider:change={setLayerOpacity}  bind:value={layerOpacity} min={0} max={1} step={0.01} input$aria-label="Layer opacity"/> -->
                    
                </div>
            {/if}
        </Content>
        
    </Panel>
</Accordion>


<style>
    .layer-header{
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        margin: auto
    }
    .layer-header-name {
        align-self:center;
        flex: 0 0 160px;
        max-width: 80%;
        flex-wrap: nowrap;
        overflow-wrap:anywhere;
    }
    .layer-header-icons{
        
        display: flex;
        flex-direction: row;
        align-self: flex-start;
    }
    .layer-name{
        
        display: flex;
        cursor:pointer;
        font-family: Roboto,serif;
        width: 100%;
        min-height: 2.5rem;
        height:auto;
        font-size: 12pt;
        justify-content: center;
        align-items: center;
        width: fit-content;
        
        
    }

    :global(.mdc-tooltip, .mdc-tooltip__content) {
        color: whitesmoke;
        background-color: black;

    }

</style>