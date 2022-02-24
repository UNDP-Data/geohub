<script lang="ts">
    let panel1Open = false;
    import {map} from '../stores/mapstore'
    import LayerOptions from "./LayerOptions.svelte"
    import { Icon } from '@smui/tab';
    export let layerCfg;
    //let lName, lDef, lType;
    //$: ({lName,  lDef, lType} = layerCfg);
    let lName,  lDef, lType;
    ({lName,lDef,lType} = layerCfg);

    let selected:boolean = lDef.layout.visibility == 'visible' ? true : false;
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

</script>
<!--	<div class="layer-item">-->
<!--		<button on:click={()=>!show}>{lName}</button>-->
<!--		<div class={isShowed ? "shown":"hidden"}>-->
<!--			<Checkbox class="select-layer" bind:checked={selected} value="{lDef.lid}" on:change={handleChange} />-->
<!--		</div>-->
<!--	</div>-->
<div class="layer-item">
    <div  class="layer-header" style="display: flex; margin-bottom: 0; height: 20px; align-items: center;">
        <Icon class="material-icons">layers</Icon>
        <h4 class="layer-name" on:click="{() => (show = !show)}">{lName}</h4>
        <input style="position: absolute; right: 0;" type="checkbox" bind:checked={selected} on:change={handleChange}>
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
    /* TODO: Change these classes according to a click of the button. The classes should be  */
    .shown{
        background-color: chartreuse;
    }
    .hidden{
        background-color: saddlebrown;
    }
    .layer-item{

    }

    .layer-name:hover{
        color: rebeccapurple;
        font-family: Roboto,serif;
    }
    .layer-name{
        cursor:pointer;
        margin-left: 5px;
        font-family: Roboto,serif;
        width: 20%;
    }
    .detail-div{
        /* This is the div where the layers are being placed */
        /*border: 1px solid grey;*/
        background: transparent;
        /*box-shadow: grey;*/
        transition: height 5s;
    }
    .layer-button:hover{
    }
</style>