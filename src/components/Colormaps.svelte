<script lang="ts">
    import Chip, { Set, Text } from '@smui/chips';
    import Button from '@smui/button';
    import Slider from '@smui/slider';
    import { layerList } from "../stores/stores"

    const colorMapTypes : Array<string> = ["Sequential", "Diverging", "Cyclic"];
    let selectedColorMapType : string = "";
    export let colorMapName;
    export let layerCfg;

    let lName,  lDef, lType, lInfo;
    ({lName,lDef,lType, lInfo} = layerCfg);
    const layerId = lDef.id;

    const layer = $layerList.filter((item)=>item.lDef.id === layerId).pop()

    let lMin = parseFloat(layer.lInfo['band_metadata'][0][1]['STATISTICS_MINIMUM']);
    let lMax = parseFloat(layer.lInfo['band_metadata'][0][1]['STATISTICS_MAXIMUM']);
    const diffValue = (lMax - lMin) * 0.5;
    let lMinScaling = Math.floor((lMin - diffValue));
    let lMaxScaling = Math.ceil((lMax + diffValue));
    
    let scalingValueStart = Math.floor(lMin * 10) / 10;
    let scalingValueEnd = Math.ceil(lMax * 10) / 10;

    export let scalingValueRange = `${scalingValueStart},${scalingValueEnd}`;
    const setScalingValueRwange = () =>{
        scalingValueRange = `${scalingValueStart},${scalingValueEnd}`;
    }
    $: scalingValueStart, setScalingValueRwange();
    $: scalingValueEnd, setScalingValueRwange();
</script>
<div class="paper-container">
    <Slider
            range
            bind:start={scalingValueStart}
            bind:end={scalingValueEnd}
            min={lMinScaling}
            max={lMaxScaling}
            step={0.1}
            input$aria-label="Range slider"
    />

    <span>   Image scaling: {scalingValueStart}, {scalingValueEnd}</span>
    <Set chips={colorMapTypes} let:chip choice bind:selected={selectedColorMapType}>
        <Chip {chip}>
            <Text>{chip}</Text>
        </Chip>
    </Set>
    <div style="justify-content: space-around; display: flex; z-index: 1000">
        {#if selectedColorMapType === "Sequential"}
            <div style="margin:auto; width: 50%">
                <Button on:click={()=>colorMapName="purples"} style="background: linear-gradient(102deg, rgba(218,112,214,1) 0%, rgba(128,0,128,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"purples"}>purples</Button>
                <Button on:click={()=>colorMapName="greys"} style="background: linear-gradient(102deg, rgba(169,169,169,1) 0%, rgba(105,105,105,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"greys"}>greys</Button>
                <Button on:click={()=>colorMapName="blues"} style="background: linear-gradient(102deg, rgba(30,144,255,1) 0%, rgba(0,0,139,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"blues"}>blues</Button>
                <Button on:click={()=>colorMapName="greens"} style="background: linear-gradient(102deg, rgba(0,255,0,1) 0%, rgba(0,100,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"greens"}>greens</Button>
                <Button on:click={()=>colorMapName="oranges"} style="background: linear-gradient(102deg, rgba(255,165,0,1) 0%, rgba(255,69,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"oranges"}>oranges</Button>
                <Button on:click={()=>colorMapName="reds"} style="background: linear-gradient(102deg, rgba(255,127,127,1) 0%, rgba(139,0,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"reds"}>reds</Button>
                <Button on:click={()=>colorMapName="orrd"} style="background: linear-gradient(102deg, rgba(255,165,0,1) 0%, rgba(255,0,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"orrd"}>Orrd</Button>
                <Button on:click={()=>colorMapName="purd"} style="background: linear-gradient(102deg, rgba(160,32,240,1) 0%, rgba(255,0,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"purd"}>Purd</Button>
                <Button on:click={()=>colorMapName="rdpu"} style="background: linear-gradient(102deg, rgba(255,0,0,1) 0%, rgba(160,32,240,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"rdpu"}>Rdpu</Button>
                <Button on:click={()=>colorMapName="bupu"} style="background: linear-gradient(102deg, rgba(0,0,255,1) 0%, rgba(160,32,240,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"bupu"}>Bupu</Button>
                <Button on:click={()=>colorMapName="gnbu"} style="background: linear-gradient(90deg, rgba(160,249,141,1) 0%, rgba(59,94,217,1) 80%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"gnbu"}>Gnpu</Button>
                <Button on:click={()=>colorMapName="pubu"} style="background: linear-gradient(102deg, rgba(68,126,238,1) 0%, rgba(177,201,225,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"pubu"}>Pubu</Button>
                <Button on:click={()=>colorMapName="bugn"} style="background: linear-gradient(101deg, rgba(0,164,255,1) 0%, rgba(13,240,54,1) 96%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"bugn"}>Bugn</Button>
                <Button on:click={()=>colorMapName="viridis"} style="background: linear-gradient(90deg, rgba(70,41,124,1) 23%, rgba(16,219,190,1) 49%, rgba(112,255,38,1) 66%, rgba(241,255,0,1) 84%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"viridis"}>viridis</Button>
                <Button on:click={()=>colorMapName="plasma"} style="background: linear-gradient(90deg, rgba(11,0,238,1) 15%, rgba(105,41,124,1) 29%, rgba(112,41,124,1) 46%, rgba(249,141,26,1) 69%, rgba(249,220,26,1) 85%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"plasma"}>plasma</Button>
                <Button on:click={()=>colorMapName="inferno"} style="background: linear-gradient(90deg, rgba(3,0,70,1) 15%, rgba(58,41,124,1) 29%, rgba(112,41,124,1) 46%, rgba(249,141,26,1) 69%, rgba(249,220,26,1) 85%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"inferno"}>inferno</Button>
                <Button on:click={()=>colorMapName="magma"} style="background: linear-gradient(90deg, rgba(11,0,238,1) 15%, rgba(105,41,124,1) 29%, rgba(112,41,124,1) 46%, rgba(249,141,26,1) 69%, rgba(249,220,26,1) 85%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"magma"}>magma</Button>
                <Button on:click={()=>colorMapName="cividis"} style="background: linear-gradient(90deg, rgba(3,0,70,1) 15%, rgba(249,220,26,1) 85%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"cividis"}>cividis</Button>
                <h6>Selected: {colorMapName}</h6>
            </div>
        {:else if selectedColorMapType==="Diverging"}
            <div style="margin:auto; width: 50%">
                <Button on:click={()=>colorMapName="piyg"} style="background: linear-gradient(90deg, rgba(255,192,203,1) 0%, rgba(255,255,0,1) 50%, rgba(0,255,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream;" value={"piyg"}>PiYG</Button>
                <Button on:click={()=>colorMapName="prgn"} style="background: linear-gradient(90deg, rgba(160,32,240,1) 0%, rgba(0,255,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"prgn"}>PRgn</Button>
                <Button on:click={()=>colorMapName="brbg"} style="background: linear-gradient(90deg, rgba(150,75,0,1) 0%, rgba(8,143,143,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"brbg"}>BrBG</Button>
                <Button on:click={()=>colorMapName="puor"} style="background: linear-gradient(90deg, rgba(255,165,0,1) 0%, rgba(106,13,173,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"puor"}>PuOr</Button>
                <Button on:click={()=>colorMapName="rdgy"} style="background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(204,207,188,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"rdgy"}>RdGy</Button>
                <Button on:click={()=>colorMapName="rdbu"} style="background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"rdbu"}>RdBu</Button>
                <Button on:click={()=>colorMapName="spectral"} style="background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,255,0,1) 33%, rgba(0,255,0,1) 66%, rgba(0,0,255,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"spectral"}>Spectral</Button>
                <Button on:click={()=>colorMapName="coolwarm"} style="background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"coolwarm"}>coolwarm</Button>
                <Button on:click={()=>colorMapName="bwr"} style="background: linear-gradient(90deg, rgba(0,0,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,0,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"bwr"}>bwr</Button>
                <Button on:click={()=>colorMapName="seismic"} style="background: linear-gradient(90deg, rgba(0,0,139,1) 0%, rgba(139,0,0,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"seismic"}>seismic</Button>
                <Button on:click={()=>colorMapName="rainbow"} style="background: linear-gradient(90deg, rgba(28,23,140,1) 0%, rgba(94,0,236,1) 17%, rgba(0,31,255,1) 34%, rgba(144,217,64,1) 50%, rgba(254,255,13,1) 65%, rgba(231,135,0,1) 78%, rgba(255,0,0,1) 91%); width: 100%; height: auto; margin:2px; color: mintcream" value={"rainbow"}>rainbow</Button>
                <Button on:click={()=>colorMapName="ocean"} style="background: linear-gradient(90deg, rgba(0,153,64,1) 0%, rgba(0,138,255,1) 100%); width: 100%; height: auto; margin:2px; color: mintcream" value={"ocean"}>ocean</Button>
                <h6>Selected: {colorMapName}</h6>
            </div>
        {:else if (selectedColorMapType==="Cyclic")}
            <div style="margin:auto; width: 50%">
                <Button on:click={()=>colorMapName="twilight"} style="background: linear-gradient(94deg, rgba(236,229,237,1) 0%, rgba(100,126,187,1) 40%, rgba(45,22,51,1) 85%, rgba(255,252,255,1) 99%);  width: 100%; height: auto; margin:2px; color: mintcream;" value={"twilight"}>twilight</Button>
                <Button on:click={()=>colorMapName="hsv"} style="background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,165,0,1) 13%, rgba(255,255,0,1) 26%, rgba(0,255,0,1) 39%, rgba(135,206,235,1) 52%, rgba(0,0,255,1) 65%, rgba(255,192,203,1) 78%, rgba(255,0,0,1) 100%);  width: 100%; height: auto; margin:2px; color: mintcream;" value={"hsv"}>hsv</Button>
                <h6>Selected: {colorMapName}</h6>
            </div>
        {:else }
        {/if}
    </div>
</div>