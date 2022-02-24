
<script lang="ts">
    import Tab, { Label, Icon } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import ColorRamps from "./ColorRamps.svelte"
    import Button from '@smui/button';
    import Paper, { Title, Subtitle, Content } from '@smui/paper';
    import {map} from "../stores/mapstore"
    import {layerList} from "../stores/stores"
    let active = ''; // Set active tab to none. No tab is by default active
    let clicked = 0;
    const tabs = ['Symbology', 'Colors']

    const filterLayer = (item) => {
        return item.id
    }

    const loadLayerWithParams = (lid) => {
        console.log("::::::::::::::::::::::::::::", $map.getSource(lid))
    }
</script>


<div>
    <!--
      Note: tabs must be unique. (They cannot === each other.)
    -->
    <TabBar class="settings-tab" tabs={tabs} let:tab bind:active>
        <!-- Note: the `tab` property is required! -->
        <Tab class="button-tab" tab={tab}>
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
    {#if active === 'Symbology'}
        <div class="paper-container">
            <Paper>
                <Title>Request</Title>
                <Content>
                <Button on:click={() => loadLayerWithParams()} class="myClass">
                    <Label>RequestReds</Label>
                </Button>
                    <h1>{clicked}</h1>
                </Content>
            </Paper>
        </div>
    {:else if active === "Colors"}
        <div class="paper-container">
            <Paper>
                <Title>Paper</Title>
                <Subtitle>This is a sheet of paper.</Subtitle>
                <Content>Paper is used to build an elevated surface.</Content>
            </Paper>
        </div>
    {/if}

</div>


<style>

    .settings-tab{
        background: dodgerblue;
    }
    :global(.button-tab){
        padding: 0;
        height: 30px;
        border: none;
        font-size: xx-small;
        font-family: "Berlin Sans FB",serif;
        font-style: unset;
        width: 10%;
    }

    .colors-card{
        margin: 0;
    }

</style>