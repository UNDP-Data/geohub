<script lang="ts">
    import {map} from '../stores/mapstore'
    import {layerList} from '../stores/stores'
    import IconButton, { Icon } from '@smui/icon-button';
    import TabBar from '@smui/tab-bar';
    import Paper from "@smui/paper"
    import MenuSurface, { MenuSurfaceComponentDev } from '@smui/menu-surface';
    import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';

    let surface: MenuSurfaceComponentDev;

    //const tilejsonURL = `${TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?scale=1&TileMatrixSetId=WebMercatorQuad&${encodedRasterURL}&bidx=1&unscale=false&resampling=nearest&rescale=0,1&colormap_name=inferno&return_mask=true`;
    export let layerCfg;
    //export const srcId = lDef.source;
    //let lName, lDef, lType;
    //$: ({lName,  lDef, lType} = layerCfg);
    export let lName,  lDef, lType;
    ({lName,lDef,lType} = layerCfg);

    let selected = false;
    //let selected:boolean = lDef.layout.visibility === 'visible';
    console.log(`selected initial value ${selected}`)
    $: visibility = selected ? 'visible' : 'none';
    const srcId = lDef.source;
    const lId = lDef.id;

    const tabs = ["Colors", "Symbology", "Filter"]
    const handleChange = () => {

        if (! $map.getLayer(lId)){
            console.log(`adding ${lId} to map`);
            $map.addLayer(lDef);
        }


        $map.setLayoutProperty(lId, 'visibility', visibility);
        // console.log($map.getStyle().layers.length);
        // console.log($map.getStyle().layers);
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
        $map.removeLayer(lId);

        //TODO remove the layer source as well if none of the layers reference it
        $layerList  = $layerList.filter((item) => item.lDef.id != lId );
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
        // lSrc.tiles[0] = newUrl;
        // $map.addSource(srcId,lSrc);
        // map.getStyle().sources[srcId].reload();
    }

    import Dialog, { Title, Content, InitialFocus } from '@smui/dialog';
    import Slider from '@smui/slider';
    import FormField from '@smui/form-field';

    let open = false;
    let showLayerInfo = false
    let layerOpacity = 100;

    const setLayerOpacity = () => {
        let lSrc = $map.getSource(srcId);
        let layerList = $map.getStyle().layers

        const layer = layerList.filter((layer) => {return layer.source === lSrc.id })
        console.log(layer[0]["id"])
        $map.setPaintProperty(
            layer[0]["id"],
            'raster-opacity',
            parseInt(String(layerOpacity)) / 100
        );
    }
</script>


<div class="accordion-container">
    <Accordion style="margin-top: 0">
        <Panel>
            <div style="display: flex; align-items: center; width: 100%; justify-content: space-around;">
            <Header>
                <span class="layer-name" on:click="{() => (show = !show)}" >{lName}</span>
            </Header>
                <IconButton size="mini" on:click={() => handleChange()} toggle bind:pressed={selected}>
                    <Icon class="material-icons">visibility_off</Icon>
                    <Icon color="primary" class="material-icons" on>visibility</Icon>
                </IconButton>
                <IconButton size="mini" class="material-icons"  on:click={() => removeLayer()} >delete</IconButton>
            </div>
            <Content>
                <div style="justify-content: center">
                    <IconButton color="primary" on:click="{() => {tabExpand('Colors')}}" size="mini" class="material-icons">palette</IconButton>
                    <IconButton on:click="{() => {tabExpand('Symbology')}}" size="mini" class="material-icons">legend_toggle</IconButton>
                    <IconButton bind:disabled size="mini" class="material-icons" on:click={() => (disabled = !disabled)}>info</IconButton>
                    <IconButton size="mini" class="material-icons" on:click={() => surface.setOpen(true)} >opacity
                    </IconButton>
                </div>

                <MenuSurface style="width: 100%; height: 50px" tab bind:this={surface} anchorCorner="TOP_MIDDLE">
                    <div style="height: 50px; justify-content: space-around">
                        <FormField style="display: flex; flex-direction: column-reverse;">
                            <input on:change={setLayerOpacity} bind:value={layerOpacity} type="range" min="0" max="100">
                            <span slot="label">Layer Opacity: {layerOpacity}</span>
                        </FormField>
                    </div>
                </MenuSurface>
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
{/if}




<style>

    .layer-name{
        text-align: left;
        display: block;
        cursor:pointer;
        font-family: Roboto,serif;
        width: 100%;
        height: auto;
        font-size: .9rem;

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