<script lang="ts">
    let panel1Open = false;
    import {map} from '../stores/mapstore'
    import {layerList} from '../stores/stores'
    import LayerOptions from "./LayerOptions.svelte"
    import { Icon } from '@smui/tab';
    import IconButton, { Icon as IIcon } from '@smui/icon-button';
    export let layerCfg;
    //let lName, lDef, lType;
    //$: ({lName,  lDef, lType} = layerCfg);
    let lName,  lDef, lType;
    ({lName,lDef,lType} = layerCfg);

    let selected:boolean = lDef.layout.visibility == 'visible' ? true : false;
    console.log(`selected initial value ${selected}`)
    $: visibility = selected ? 'visible' : 'none';
    const srcId = lDef.source;
    const lId = lDef.id;

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


    const removeLayer = () => {
        console.log(`removing ${lId}`)
        $map.removeLayer(lId);
        
        //TODO remove the layer source as well if none of the layers reference it 
        $layerList  = $layerList.filter((item) => item.lDef.id != lId );

    };

</script>
<!--	<div class="layer-item">-->
<!--		<button on:click={()=>!show}>{lName}</button>-->
<!--		<div class={isShowed ? "shown":"hidden"}>-->
<!--			<Checkbox class="select-layer" bind:checked={selected} value="{lDef.lid}" on:change={handleChange} />-->
<!--		</div>-->
<!--	</div>-->
<div class="layer-item">
    <div  class="layer-header" >
        <!-- <input  type="checkbox" bind:checked={selected} on:change={handleChange}> -->

        
        <IconButton class="material-icons"  on:click="{() => (show = !show)}" >settings</IconButton>
        <span class="layer-name" on:click="{() => (show = !show)}" >{lName}</span>
        
        <IconButton on:click={() => handleChange()} toggle bind:pressed={selected} >
            <Icon class="material-icons" on>visibility</Icon>
            <Icon class="material-icons">visibility_off</Icon>
        </IconButton>
        <IconButton class="material-icons"  on:click={() => removeLayer()} >delete</IconButton>
           
        
        
    </div>

    {#if show}
        <div style="align-items: center" class="detail-div">
            <LayerOptions/>
        </div>
        <br/>
    {:else}
        <br/>
    {/if}
</div>



<style>
    .layer-header {
        display: flex; 
        flex-direction: row;
        height: auto; 
        justify-content:space-evenly;
        border-bottom: 3px solid;
    }
    



    .layer-name:hover{
        color: rebeccapurple;
        font-family: Roboto,serif;
    }
    .layer-name{
        display: flex;
        border: 0px solid black;
        cursor:pointer;
        font-family: Roboto,serif;
        width: 150px;
        
        /* overflow-wrap: break-word; */
        word-break:break-all;
        align-self:center;
        /* justify-content: cente; */

        
        
        
    }
    .detail-div{
        padding-top: 0rem;
        /* This is the div where the layers are being placed */
        /*border: 1px solid grey;*/
        background: white;
        /*box-shadow: grey;*/
        transition: height 5s;
    }
    
</style>