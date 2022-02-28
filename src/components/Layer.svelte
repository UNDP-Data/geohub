<script lang="ts">
    import {map} from '../stores/mapstore'
    import {layerList} from '../stores/stores'
    import IconButton, { Icon } from '@smui/icon-button';
    import TabBar from '@smui/tab-bar';
    import Paper from "@smui/paper"
    import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
    import Menu, { MenuComponentDev } from '@smui/menu';
    import FormField from '@smui/form-field';

    let menu: MenuComponentDev;


    export let layerCfg;
    export let lName,  lDef, lType;
    ({lName,lDef,lType} = layerCfg);

    let selected = false;
    console.log(`selected initial value ${selected}`)
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

        console.log("Clicked!!!")
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
        $layerList = $layerList.filter((item) => item.lDef.id !== lId);
    };

    const openOpacity = () => {

    }
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

    import SegmentedButton, { Segment } from '@smui/segmented-button';
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
    let layerOpacity = 100;

    const setLayerOpacity = () => {
        let lSrc = $map.getSource(srcId);
        let layerList = $map.getStyle().layers

        const layer = layerList.filter((layer) => {return layer.source === lSrc.id })


        console.log(layer[0].type)
        if (layer[0].type==="raster"){
            $map.setPaintProperty(
                layer[0]["id"],
                'raster-opacity',
                layerOpacity / 100
            );
        }
        else
        {
            if(layer.type==="vector" && layer[0].type==="line"){
            }
            console.log("Layer is a line");
            $map.setPaintProperty(
                layer[0]["id"],
                'line-opacity',
                layerOpacity / 100
            )
        if(layer.type==="vector" && layer[0].type==="point"){

            console.log("Layer is a point")
            // $map.setPaintProperty(
            //     layer[0]["id"],
            //     'line-width',
            //     layerOpacity
            // )
        }
        if(layer.type==="vector" && layer[0].type==="polygon"){
            console.log("Layer is a polygon")
            // $map.setPaintProperty(
            //     layer[0]["id"],
            //     'line-width',
            //     layerOpacity
            // )
        }
        }

    }

    let layerWidth = 1;
    let setLineWidth = () => {
        let lSrc = $map.getSource(srcId);
        let layerList = $map.getStyle().layers

        const layer = layerList.filter((layer) => {return layer.source === lSrc.id })
        $map.setPaintProperty(
            layer[0]["id"],
            'line-width',
            layerWidth
        );
    }
</script>


<div class="accordion-container">
    <Accordion style="margin-top: 0">
        <Panel>
            <div style="display: flex; align-items: center; width: 100%; justify-content: space-around;">
            <Header style="height: 100%">
                <h6 class="layer-name" on:click="{() => (show = !show)}" >{lName}</h6>
            </Header>
                <IconButton size="mini" on:click={() => handleChange()} toggle bind:pressed={selected}>
                    <Icon class="material-icons">visibility_off</Icon>
                    <Icon color="primary" class="material-icons" on>visibility</Icon>
                </IconButton>
                <IconButton size="mini" class="material-icons"  on:click={() => removeLayer()} >delete</IconButton>
            </div>
            <Content>
                {#if lType === "raster" }
                <div style="justify-content: space-around; display: flex">
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
                <Menu bind:this={menu}>
                    <div style="height: 50px; justify-content: space-around">
                        <FormField style="display: flex; flex-direction: column-reverse;">
                            <input on:change={setLayerOpacity} bind:value={layerOpacity} type="range" min="0" max="100">
                            <span slot="label">Layer Opacity: {layerOpacity}</span>
                        </FormField>
                    </div>
                </Menu>
            </Content>
        </Panel>
    </Accordion>
</div>
<!--    <Paper variant="unelevated" square class="mdc-ripple-surface" color="cream" style="padding: 0">-->
<!--        <div  class="control-icons">-->
<!--            <IconButton size="mini" on:click={() => handleChange()} toggle bind:pressed={selected}>-->
<!--                <Icon class="material-icons">visibility_off</Icon>-->
<!--                <Icon color="primary" class="material-icons" on>visibility</Icon>-->
<!--            </IconButton>-->
<!--            <IconButton size="mini" class="material-icons"  on:click={() => removeLayer()} >delete</IconButton>-->
<!--        </div>-->
<!--        <span class="layer-name" on:click="{() => (show = !show)}" >{lName}</span>-->
<!--    </Paper>-->

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
        <div style="height: 50px; justify-content: space-around; margin-top: 20px;">
            <FormField style="display: flex; align-items: center">
                <input on:change={setLayerOpacity} bind:value={layerOpacity} type="range" min="0" max="100">
                <h6 slot="label">Layer Opacity: {layerOpacity}</h6>
            </FormField>
        </div>
    {/if}
{:else if active === "Linewidth"}
    {#if show}
        <div style="height: 50px; justify-content: space-around; margin-top: 20px;">
            <FormField style="display: flex; align-items: center">
                <input on:change={setLineWidth} bind:value={layerWidth} type="range" min="0" max="10" step="0.1">
                <h6 slot="label">Line Width: {layerWidth}</h6>
            </FormField>
        </div>
    {/if}
{/if}




<style>

    .layer-name{
        text-align: left;
        display: block;
        cursor:pointer;
        font-family: Roboto,serif;
        width: 100%;
        height: auto;
        font-size: .7rem;
    }

    .control-icons{
        display: flex;
        flex-direction: row;
        justify-content:space-evenly;
    }

    :global(.smui-accordion__panel){
        width: 100%;
    }
</style>