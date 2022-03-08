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
    import Select, { Option } from '@smui/select';

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
    const colormaps = ['accent', 'accent_r', 'afmhot', 'afmhot_r', 'autumn', 'autumn_r', 'binary', 'binary_r', 'blues', 'blues_r', 'bone', 'bone_r', 'brbg', 'brbg_r', 'brg', 'brg_r', 'bugn', 'bugn_r', 'bupu', 'bupu_r', 'bwr', 'bwr_r', 'cfastie', 'cividis', 'cividis_r', 'cmrmap', 'cmrmap_r', 'cool', 'cool_r', 'coolwarm', 'coolwarm_r', 'copper', 'copper_r', 'cubehelix', 'cubehelix_r', 'dark2', 'dark2_r', 'flag', 'flag_r', 'gist_earth', 'gist_earth_r', 'gist_gray', 'gist_gray_r', 'gist_heat', 'gist_heat_r', 'gist_ncar', 'gist_ncar_r', 'gist_rainbow', 'gist_rainbow_r', 'gist_stern', 'gist_stern_r', 'gist_yarg', 'gist_yarg_r', 'gnbu', 'gnbu_r', 'gnuplot', 'gnuplot2', 'gnuplot2_r', 'gnuplot_r', 'gray', 'gray_r', 'greens', 'greens_r', 'greys', 'greys_r', 'hot', 'hot_r', 'hsv', 'hsv_r', 'inferno', 'inferno_r', 'jet', 'jet_r', 'magma', 'magma_r', 'nipy_spectral', 'nipy_spectral_r', 'ocean', 'ocean_r', 'oranges', 'oranges_r', 'orrd', 'orrd_r', 'paired', 'paired_r', 'pastel1', 'pastel1_r', 'pastel2', 'pastel2_r', 'pink', 'pink_r', 'piyg', 'piyg_r', 'plasma', 'plasma_r', 'prgn', 'prgn_r', 'prism', 'prism_r', 'pubu', 'pubu_r', 'pubugn', 'pubugn_r', 'puor', 'puor_r', 'purd', 'purd_r', 'purples', 'purples_r', 'rainbow', 'rainbow_r', 'rdbu', 'rdbu_r', 'rdgy', 'rdgy_r', 'rdpu', 'rdpu_r', 'rdylbu', 'rdylbu_r', 'rdylgn', 'rdylgn_r', 'reds', 'reds_r', 'rplumbo', 'schwarzwald', 'seismic', 'seismic_r', 'set1', 'set1_r', 'set2', 'set2_r', 'set3', 'set3_r', 'spectral', 'spectral_r', 'spring', 'spring_r', 'summer', 'summer_r', 'tab10', 'tab10_r', 'tab20', 'tab20_r', 'tab20b', 'tab20b_r', 'tab20c', 'tab20c_r', 'terrain', 'terrain_r', 'twilight', 'twilight_r', 'twilight_shifted', 'twilight_shifted_r', 'viridis', 'viridis_r', 'winter', 'winter_r', 'wistia', 'wistia_r', 'ylgn', 'ylgn_r', 'ylgnbu', 'ylgnbu_r', 'ylorbr', 'ylorbr_r', 'ylorrd', 'ylorrd_r'];
    let colorMapName;
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

    $: colorMapName, selectColorMap();

    const selectColorMap = () => {
        if(colorMapName){
            let layerS = allLayers.filter((item)=>item.id===layerId).pop()['source']
            const layerSource = $map.getSource(layerS)
            let old_url = layerSource.tiles[0]

            console.log(old_url)
            let oldUrl = new URL(old_url)
            oldUrl.searchParams.set("colormap_name", colorMapName)
            let newUrl = oldUrl.toString();

            console.log(newUrl);
            $map.getSource(layerS).tiles = [decodeURI(newUrl)];
            $map.style.sourceCaches[layerS].clearTiles();
            $map.style.sourceCaches[layerS].update($map.transform);
            $map.triggerRepaint();
        }


    }

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
            
                <div style="display:flex; justify-content: center;">
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

<!--                        <select class="select-colormap" bind:value={colorMapName} label="Select Menu">-->
<!--                            {#each colormaps as color}-->
<!--                                <option class="colormap" value="{color}">{color}</option>-->
<!--                            {/each}-->
<!--                        </select>-->
<!--                        <pre class="status">Selected: {colorMapName}</pre>-->

                <div class="columns margins" style="justify-content: flex-start;">
                    <div>
                        <Select bind:value={colorMapName} label="Choose new colormap">
                            {#each colormaps as color}
                                <Option value={color}>{color}</Option>
                            {/each}
                        </Select>
                        <h5 class="status">Selected: {colorMapName}</h5>
                    </div>
                </div>
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
    .select-colormap{
        width: 100%;
        height: auto;
        border: none;
    }

    .colormap{
        font-family:"Roboto Light",serif;
    }
</style>