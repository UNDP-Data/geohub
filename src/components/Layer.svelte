<script lang="ts">
    import {map} from '../stores/mapstore'
    import {layerList} from '../stores/stores'
    import IconButton, { Icon } from '@smui/icon-button';
    import TabBar from '@smui/tab-bar';
    import Paper from "@smui/paper"
    import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
    import SegmentedButton, { Segment } from '@smui/segmented-button';


    export let layerCfg;
    export let lName,  lDef, lType;
    ({lName,lDef,lType} = layerCfg);

    let selected = false;
    $: visibility = selected ? 'visible' : 'none';
    const srcId = lDef.source;
    const lId = lDef.id;

    const tabs = ["Colors", "Symbology", "Opacity"]
    const handleChange = () => {

        if (! $map.getLayer(lId)){
            console.log(`adding ${lId} to map`);
            $map.addLayer(lDef);
        }
        $map.setLayoutProperty(lId, 'visibility', visibility);
    };

    let show = false;
    const isShowed = () => {

        show = !show
        return show
    }

    // let lSrc = $map.getSource(srcId);
    // $map.removeSource(srcId);
    // lSrc.tiles[0] = newUrl;
    // $map.addSource(srcId,lSrc);
    // map.getStyle().sources[srcId].reload();

    const removeLayer = () => {
        console.log(`removing ${lId}`)

        if($map.getLayer(lId)){
            $map.removeLayer(lId);
        }
        //TODO remove the layer source as well if none of the layers reference it
        $layerList  = $layerList.filter((item) => item.lDef.id !== lId );
    };

    
    let querySelected : boolean = true;
    let active = "";


    const tabExpand = (tabName) => {
        if(show){
            if(active != tabName){
                active=tabName;
            }
            else{
                show = !show;
            }
        }
        else{
            show = !show;
            active = tabName;
        }
    }

    let disabled : boolean = false;

    let choices = ['viridis', 'plasma', 'inferno', 'magma', 'cividis'];
    let chosen = 'viridis';
    let value = 50;

    const handleUrlChange = (colorMap) =>{
        // Need to reconstruct the url. Need to reload the map
        // The reconstruction:
        const srcId = lDef.source;
        let lSrc = $map.getSource(srcId);

        console.log("BEFORE SOURCE :::::::::::::::: ", lSrc)
        lSrc.tiles[0] = `https://undp.livedata.link/hrea/tiles/{z}/{x}/{y}.png?scale=1&TileMatrixSetId=WebMercatorQuad&url=https://undpngddlsgeohubdev01.blob.core.windows.net/testforgeohub/HREA_Algeria_2012_v1%2FAlgeria_rade9lnmu_2012.tif&url_params=c3Y9MjAyMC0xMC0wMiZzZT0yMDIyLTAzLTAxVDE1JTNBNTUlM0EwMFomc3I9YiZzcD1yJnNpZz04bTBVWjBhJTJCWTJPTHo5MThVUVNCTnAwcTdKYWhYSzdXdFZEdjFieHlhTm8lM0Q=&bidx=1&unscale=false&resampling=nearest&rescale=0,1&colormap_name=${colorMap}&return_mask=true`
        //console.log(lSrc.tiles[0])
        console.log($map.getStyle().sources[srcId])//.reload();
    }


    let open = false;
    let showLayerInfo = false
    let layerOpacity = 1;

    const setLayerOpacity = () => {
        let lSrc = $map.getSource(srcId);
        let layerList = $map.getStyle().layers

        const layer = layerList.filter((layer) => {return layer.source === lSrc.id }).pop()

        console.log(layer.type, lId, layer.id);
        if (layer.type==="raster"){
            $map.setPaintProperty(
                lId,
                'raster-opacity',
                layerOpacity
            );
        }
        else
        {
            if(layer.type==="line"){
                // console.log("Layer is a line");
                $map.setPaintProperty(
                    lId,
                    'line-opacity',
                    layerOpacity
                )
            }
            
        if(layer.type==="symbol"){

            // console.log("Layer is a point")
            $map.setPaintProperty(
                lId,
                'icon-opacity',
                layerOpacity
            )
        }
        if(layer.type==="fill"){
            console.log("Layer is a polygon")
            $map.setPaintProperty(
                lId,
                'fill-opacity',
                layerOpacity
            )
        }
        }

    }

    let layerWidth = 1;
    let setLineWidth = () => {
        let lSrc = $map.getSource(srcId);
        let layerList = $map.getStyle().layers

        const layer = layerList.filter((layer) => {return layer.source === lSrc.id })
        $map.setPaintProperty(
            lId,
            'line-width',
            layerWidth
        );
    }

</script>

<div class="accordion-container">
    <Accordion >
<<<<<<< HEAD
        <Panel variant='unelevated' square color="white">
=======
        <Panel style="padding: 0" variant='unelevated' square>
>>>>>>> 0717dd37ce0d799718ec2bc34be9244eb054f8eb
            <div class="layer-header" >

                <div class="layer-header-name">
                    <Header style="border:1px">
                        <span class="layer-name" on:click="{() => (show = !show)}" >{lName} </span>
                        
                    </Header>
                </div>
                <div class="layer-header-icons">
                    <IconButton size="mini" on:click={() => handleChange()} toggle bind:pressed={selected}>
                        <Icon class="material-icons">visibility_off</Icon>
                        <Icon color="primary" class="material-icons" on>visibility</Icon>
                    </IconButton>
                    <IconButton size="mini" class="material-icons"  on:click={() => removeLayer()} >delete</IconButton>
                </div>
               
                    
            </div>
            <Content>
                
                {#if lType === "raster" }
                    <div style="justify-content: center">
                        <IconButton color="primary" on:click="{() => {tabExpand('Colors')}}" size="mini" class="material-icons">palette</IconButton>
                        <IconButton on:click="{() => {tabExpand('Symbology')}}" size="mini" class="material-icons">legend_toggle</IconButton>
                        <IconButton bind:disabled size="mini" class="material-icons" on:click={() => (disabled = !disabled)}>info</IconButton>
                        <IconButton size="mini" class="material-icons" on:click="{() => {tabExpand('Opacity')}}">opacity
                        </IconButton>
                    </div>
                {:else if lType === "vector"}
                    {#if lDef.type === "line" }
                        <IconButton size="mini" class="material-icons" on:click={() => {tabExpand('Linewidth')}} >circle
                        </IconButton>
                        <IconButton size="mini" class="material-icons" on:click="{() => {tabExpand('Opacity')}}">opacity
                        </IconButton>
                    {:else if lDef.type === "point"}
                        <h6>Point Options</h6>
                    {:else if lDef.type === "polygon"}
                        <h6>Polygon Options</h6>
                    {/if}
                {/if}


                <TabBar class="settings-tab" tabs={tabs} let:tab bind:active>
                </TabBar>
                {#if active === 'Symbology'}
                    {#if show}
                        Legend
                    {/if}
                {:else if active === "Colors"}
                {#if show}
                    <Paper style="padding: 0" variant="unelevated">
                        <SegmentedButton style="width: 100%" segments={choices} let:segment singleSelect bind:chosen>
                            <!-- Note: the `segment` property is required! -->
                            <Segment bind:chosen style="width: 25%" {segment} on:click={()=>{handleUrlChange(segment)}}>
                                {segment}
                            </Segment>
                        </SegmentedButton>
                    </Paper>
                {/if}
                
                {:else if active === "Opacity"}
                    {#if show}
                        <div style="margin:0; display:flex; flex-direction:row; justify-content: space-even;">
                            <span>Opacity: </span>
                            <input on:change={setLayerOpacity} bind:value={layerOpacity} color="primary" type="range" min="0" max="1" step="0.01">
                            <span> {layerOpacity}</span>
                        </div>
                    {/if}
                {:else if active === "Linewidth"}
                    {#if show}
                        <div style="display:flex; flex-direction:row; justify-content: space-around">
                            <span>Line Width: </span>
                            <input on:change={setLineWidth} bind:value={layerWidth} type="range" min="0" max="5" step=".1">
                            <span> {layerWidth}</span>
                        </div>
                    {/if}
                {/if}
                

            </Content>
        </Panel>
    </Accordion>
</div>




<style>
    .layer-header {
        overflow-wrap:break-word;
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        flex-wrap: nowrap;
        align-items: center; 
        width: 100%; 
        justify-content:space-evenly;
    }

    .layer-header-name {
        align-self:center;
        flex: 0 0 200px;
    }

    .layer-header-icons{
        display: flex;
        flex-direction: row;
        /* justify-content:space-around; */
        align-self: flex-start;
        /* align-content: flex-start; */
    }
    .layer-name{
        /* text-align: left; */
        display: flex;
        cursor:pointer;
        font-family: Roboto,serif;
        width: 100%;
        height: 2rem;
        font-size: 12pt;
        justify-content: center;
        align-items: center;
    }


    :global(.smui-paper__content){
        padding: 0!important;
    }
</style>