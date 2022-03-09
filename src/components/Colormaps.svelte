<script lang="ts">
    import Select, { Option } from '@smui/select';
    import Chip, { Set, Text } from '@smui/chips';
    import Paper, { Content } from '@smui/paper';


    const colorMapTypes : Array<string> = ["Sequential", "Diverging", "Cyclic"];
    let selectedColorMapType : string = "";
    export let colorMapName;


</script>
<div class="paper-container">
    <Set chips={colorMapTypes} let:chip choice bind:selected={selectedColorMapType}>
        <Chip {chip}>
            <Text>{chip}</Text>
        </Chip>
    </Set>
    <div style="justify-content: space-around; display: flex; z-index: 1000">
        {#if selectedColorMapType === "Sequential"}
            <div>
                <div>
                    <Paper variant="unelevated">
                        <Content>
                            <Select style="height: 10px;" bind:value={colorMapName} label="Sequential">
                                <Option style="background: linear-gradient(102deg, rgba(218,112,214,1) 0%, rgba(128,0,128,1) 100%);" value={"purples"}>purples</Option>
                                <Option style="background: linear-gradient(102deg, rgba(169,169,169,1) 0%, rgba(105,105,105,1) 100%);" value={"greys"}>greys</Option>
                                <Option style="background: linear-gradient(102deg, rgba(30,144,255,1) 0%, rgba(0,0,139,1) 100%);" value={"blues"}>blues</Option>
                                <Option style="background: linear-gradient(102deg, rgba(0,255,0,1) 0%, rgba(0,100,0,1) 100%);" value={"greens"}>greens</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,165,0,1) 0%, rgba(255,69,0,1) 100%);" value={"oranges"}>oranges</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,127,127,1) 0%, rgba(139,0,0,1) 100%);" value={"reds"}>reds</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,165,0,1) 0%, rgba(255,0,0,1) 100%); height: 20px" value={"orrd"}>Orrd</Option>
                                <Option style="background: linear-gradient(102deg, rgba(160,32,240,1) 0%, rgba(255,0,0,1) 100%);" value={"purd"}>Purd</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,0,0,1) 0%, rgba(160,32,240,1) 100%);" value={"rdpu"}>Rdpu</Option>
                                <Option style="background: linear-gradient(102deg, rgba(0,0,255,1) 0%, rgba(160,32,240,1) 100%);" value={"bupu"}>Bupu</Option>
                                <Option style="background: linear-gradient(90deg, rgba(160,249,141,1) 0%, rgba(59,94,217,1) 80%);" value={"gnbu"}>Gnpu</Option>
                                <Option style="background: linear-gradient(102deg, rgba(68,126,238,1) 0%, rgba(177,201,225,1) 100%);" value={"pubu"}>Pubu</Option>
                                <Option style="background: linear-gradient(101deg, rgba(0,164,255,1) 0%, rgba(13,240,54,1) 96%);" value={"bugn"}>Bugn</Option>
                                <Option style="background: linear-gradient(90deg, rgba(70,41,124,1) 23%, rgba(16,219,190,1) 49%, rgba(112,255,38,1) 66%, rgba(241,255,0,1) 84%);" value={"viridis"}>viridis</Option>
                                <Option style="background: linear-gradient(90deg, rgba(11,0,238,1) 15%, rgba(105,41,124,1) 29%, rgba(112,41,124,1) 46%, rgba(249,141,26,1) 69%, rgba(249,220,26,1) 85%);" value={"plasma"}>plasma</Option>
                                <Option style="background: linear-gradient(90deg, rgba(3,0,70,1) 15%, rgba(58,41,124,1) 29%, rgba(112,41,124,1) 46%, rgba(249,141,26,1) 69%, rgba(249,220,26,1) 85%);" value={"inferno"}>inferno</Option>
                                <Option style="background: linear-gradient(90deg, rgba(11,0,238,1) 15%, rgba(105,41,124,1) 29%, rgba(112,41,124,1) 46%, rgba(249,141,26,1) 69%, rgba(249,220,26,1) 85%);" value={"magma"}>magma</Option>
                                <Option style="background: linear-gradient(90deg, rgba(3,0,70,1) 15%, rgba(249,220,26,1) 85%);" value={"cividis"}>cividis</Option>
                            </Select>
                        </Content>
                    </Paper>
                </div>
            </div>
        {:else if selectedColorMapType==="Diverging"}
            <div>
                <div>
                    <Paper variant="unelevated">
                        <Content>
                            <Select style="height: 10px;" bind:value={colorMapName} label="Diverging">
                                <Option style="background: linear-gradient(102deg, rgba(255,192,203,1) 0%, rgba(255,255,0,1) 50%, rgba(0,255,0,1) 100%);" value={"piyg"}>PiYG</Option>
                                <Option style="background: linear-gradient(102deg, rgba(160,32,240,1) 0%, rgba(0,255,0,1) 100%);" value={"prgn"}>PRgn</Option>
                                <Option style="background: linear-gradient(102deg, rgba(150,75,0,1) 0%, rgba(8,143,143,1) 100%);" value={"brbg"}>BrBG</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,165,0,1) 0%, rgba(106,13,173,1) 100%);" value={"puor"}>PuOr</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,0,0,1) 0%, rgba(204,207,188,1) 100%);" value={"rdgy"}>RdGy</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%);" value={"rdbu"}>RdBu</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,0,0,1) 0%, rgba(255,255,0,1) 33%, rgba(0,255,0,1) 66%, rgba(0,0,255,1) 100%);" value={"spectral"}>Spectral</Option>
                                <Option style="background: linear-gradient(102deg, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%);" value={"coolwarm"}>coolwarm</Option>
                                <Option style="background: linear-gradient(102deg, rgba(0,0,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,0,0,1) 100%);" value={"bwr"}>bwr</Option>
                                <Option style="background: linear-gradient(102deg, rgba(0,0,139,1) 0%, rgba(139,0,0,1) 100%);" value={"seismic"}>seismic</Option>
                                <Option style="background: linear-gradient(90deg, rgba(28,23,140,1) 0%, rgba(94,0,236,1) 17%, rgba(0,31,255,1) 34%, rgba(144,217,64,1) 50%, rgba(254,255,13,1) 65%, rgba(231,135,0,1) 78%, rgba(255,0,0,1) 91%);" value={"rainbow"}>rainbow</Option>
                                <Option style="background: linear-gradient(90deg, rgba(0,153,64,1) 0%, rgba(0,138,255,1) 100%);" value={"ocean"}>ocean</Option>
                            </Select>
                        </Content>
                    </Paper>

                </div>
            </div>
        {:else if (selectedColorMapType==="Cyclic")}
            <div>
                <div>
                    <Paper>
                        <Content>
                            <Select style="height: 10px;" bind:value={colorMapName} label="Cyclic">
                                <Option style="background: linear-gradient(94deg, rgba(236,229,237,1) 0%, rgba(100,126,187,1) 40%, rgba(45,22,51,1) 85%, rgba(255,252,255,1) 99%);" value={"twilight"}>twilight</Option>
                                <Option style="background: linear-gradient(90deg, rgba(243,230,240,1) 0%, rgba(45,21,55,1) 10%, rgba(73,55,79,1) 86%, rgba(255,253,252,1) 97%);" value={"twilight_shifted"}>twilight_shifted</Option>
                                <Option style="background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,165,0,1) 13%, rgba(255,255,0,1) 26%, rgba(0,255,0,1) 39%, rgba(135,206,235,1) 52%, rgba(0,0,255,1) 65%, rgba(255,192,203,1) 78%, rgba(255,0,0,1) 100%);" value={"hsv"}>hsv</Option>
                            </Select>
                        </Content>
                    </Paper>
                </div>
            </div>
        {:else }
        {/if}
    </div>
</div>