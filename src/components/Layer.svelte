<script lang="ts">
    let panel1Open = false;
    import {map} from '../stores/mapstore'
    import {layerList} from '../stores/stores'
    import LayerOptions from "./LayerOptions.svelte"
    import { Icon } from '@smui/tab';
    import IconButton, { Icon as IIcon } from '@smui/icon-button';
    import Tab, {Label} from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import Paper from "@smui/paper"
    import Ripple from '@smui/ripple';
    import {tree} from "../stores/stores"
    //const tilejsonURL = `${TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?scale=1&TileMatrixSetId=WebMercatorQuad&${encodedRasterURL}&bidx=1&unscale=false&resampling=nearest&rescale=0,1&colormap_name=inferno&return_mask=true`;
    export let layerCfg;
    //export const srcId = lDef.source;
    //let lName, lDef, lType;
    //$: ({lName,  lDef, lType} = layerCfg);
    export let lName,  lDef, lType;
    ({lName,lDef,lType} = layerCfg);

    let selected:boolean = lDef.layout.visibility == 'visible' ? true : false;
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
        //$map.removeLayer(lId);
        
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

    import Slider from '@smui/slider';

    import MenuSurface, { MenuSurfaceComponentDev } from '@smui/menu-surface';
    import SegmentedButton, { Segment } from '@smui/segmented-button';
    let surface: MenuSurfaceComponentDev;
    let disabled : boolean = false;
    import FormField from '@smui/form-field';

    let choices = ['viridis', 'plasma', 'inferno', 'magma', 'cividis'];
    let chosen = 'viridis';
    let value = 50;

    const handleUrlChange = (colorMap) =>{


        // Need to reconstruct the url. Need to reload the map
        // The reconstruction:


        let lSrc = $map.getSource(srcId);
        let text=lSrc.tiles[0]
        console.log(lSrc.id)
        text.replace(/inferno/g,colorMap);

        console.log("NEW URL", text)
        // lSrc.tiles[0] = newUrl;
        // $map.addSource(srcId,lSrc);
        // map.getStyle().sources[srcId].reload();
    }

    import Dialog, { Title, Content, Actions, InitialFocus } from '@smui/dialog';
    import Button, { Label } from '@smui/button';
    import Slider from '@smui/slider';
    import FormField from '@smui/form-field';

    let open = false;
    let showLayerInfo = false
    let layerOpacity = 100;
</script>

    <Paper square class="mdc-ripple-surface" color="cream" style="margin-bottom: 1ch; padding: 0">
        <div  class="control-icons">
            <IconButton color="primary" on:click="{() => {tabExpand('Colors')}}" size="mini" class="material-icons">palette</IconButton>
            <IconButton on:click="{() => {tabExpand('Symbology')}}" size="mini" class="material-icons">legend_toggle</IconButton>
<!--            <IconButton size="mini" on:click={() => handleChange()} toggle bind:pressed={querySelected} >-->
<!--                <Icon color="primary" class="material-icons" on>toggle_off</Icon>-->
<!--                <Icon class="material-icons">toggle_on</Icon>-->
<!--            </IconButton>-->
            <IconButton bind:disabled size="mini" class="material-icons" on:click={() => (disabled = !disabled)}>info</IconButton>
            <IconButton size="mini" class="material-icons" on:click={() => (open = true)} >opacity
            </IconButton>
            <IconButton size="mini" on:click={() => handleChange()} toggle bind:pressed={selected} >
                <Icon color="primary" class="material-icons" on>visibility</Icon>
                <Icon class="material-icons">visibility_off</Icon>
            </IconButton>
            <IconButton size="mini" class="material-icons"  on:click={() => removeLayer()} >delete</IconButton>

        </div>
        <span class="layer-name" on:click="{() => (show = !show)}" >{lName}</span>
    </Paper>

        <IconButton class="material-icons"  on:click="{() => (show = !show)}" >settings</IconButton>
        <span class="layer-name" on:click="{() => (show = !show)}" >{lName}</span>

        <IconButton on:click={() => handleChange()} toggle bind:pressed={selected} >
            <Icon class="material-icons" on>visibility</Icon>
            <Icon class="material-icons">visibility_off</Icon>
        </IconButton>
        <IconButton class="material-icons"  on:click={() => removeLayer()} >delete</IconButton>

<TabBar class="settings-tab" tabs={tabs} let:tab bind:active>
    <!-- Note: the `tab` property is required! -->
<!--    <Tab class="button-tab" tab={tab}>-->
<!--&lt;!&ndash;        <Label>{tab}</Label>&ndash;&gt;-->
<!--    </Tab>-->
</TabBar>
{#if active === 'Symbology'}
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
{:else if active === "Colors"}
{#if show}
    Colors Content
    {/if}
{/if}


<Dialog
        bind:open
        aria-labelledby="slider-title"
        aria-describedby="slider-content"
>
    <Title id="slider-title">Layer Opacity Control</Title>
    <Content id="slider-content">
        <div>
            <FormField style="display: flex; flex-direction: column-reverse;">
                <Slider
                        bind:value={layerOpacity}
                        use={[InitialFocus]}
                        style="width: 100%;"
                />
                <span slot="label">Layer Opacity: {layerOpacity}</span>
            </FormField>
        </div>
    </Content>
<!--    <Actions>-->
<!--        <Button action="accept">-->
<!--            <Label>Done</Label>-->
<!--        </Button>-->
<!--    </Actions>-->
</Dialog>
<!--<MenuSurface tab bind:this={surface} anchorCorner="TOP_START">-->
<!--    <div style="height: 50px; justify-content: space-around">-->
<!--        <span>Layer Opacity: {value}</span>-->
<!--        <input type="range" min="0" max="100" bind:value>-->
<!--    </div>-->
<!--</MenuSurface>-->

<style>

    .layer-name{
        text-align: center;
        display: block;
        cursor:pointer;
        font-family: Roboto,serif;
        width: 100%;
        height: auto;

    }

    .control-icons{
        display: flex;
        flex-direction: row;
        justify-content:space-evenly;
    }
</style>