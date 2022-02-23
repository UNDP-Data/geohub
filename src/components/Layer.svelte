<script lang="ts">
    let panel1Open = false;
    import {map} from '../stores/mapstore'

    export let layerCfg;
    export let lName, lSrc, lDef;
    $: ({lName, lSrc, lDef} = layerCfg);
    $:mmap = $map;
    let selected:boolean = false;

    const handleChange = () => {
        const srcId = lDef.source;
        const lId = lDef.id;

        if (selected) {

            $map.addSource(srcId,lSrc);
            $map.addLayer(lDef);


        } else{
            $map.removeLayer(lId);
            $map.removeSource(srcId);

        }

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
        <h4 class="layer-name" on:click="{() => (show = !show)}">{lName}</h4>
        <input style="position: absolute; right: 0;" type="checkbox" bind:checked={selected} value="{lDef.lid}" on:change={handleChange}>
    </div>

    {#if show}
        <div style="margin-top:0;" class="detail-div">
            Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
            Lorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem IpsumLorem Ipsum Lorem Ipsum
        </div>
    {:else}
    {/if}
</div>
<!-- <AccordionItem key={lDef.lid}>
    <h5 slot='header'>{lName} </h5>
    <div slot='body'>

    </div>
</AccordionItem> -->
<!-- <Item>
    <Label>{lName}</Label>
      <Meta>
        <Checkbox bind:checked={selected} value="{lDef.lid}" on:change={handleChange} />
    </Meta>

</Item> -->


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
        font-family: Calibri;
    }
    .layer-name{
        cursor:pointer;
        margin-left: 5px;
        font-family: Rockwell,serif;
        width: 80%;
    }
    .detail-div{
        /* This is the div where the layers are being placed */
        border: 1px solid grey;
        background: transparent;
        box-shadow: grey;
        transition: height 5s;
    }
    .layer-button:hover{
    }
</style>