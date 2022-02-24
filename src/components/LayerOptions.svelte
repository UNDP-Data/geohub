<div>
    <!--
      Note: tabs must be unique. (They cannot === each other.)
    -->
    <TabBar tabs={layertabs.names} let:tab bind:active>
        <!-- Note: the `tab` property is required! -->
        <Tab class="layer-tab" {tab}>
<!--            <Icon class="material-icons">palette</Icon>-->
            <Label>{tab}</Label>
        </Tab>
    </TabBar>
    {#if active === 'Symbology'}
        Symbology
    {:else if active === "Colors"}
        <ColorRamps />
    {/if}

</div>

<script lang="ts">
    import Tab, { Label, Icon } from '@smui/tab';
    import TabBar from '@smui/tab-bar';
    import ColorRamps from "./ColorRamps.svelte"

    let active = 'Home';
    const layertabs = {
        names:['Symbology', 'Colors'],
        symbols:["palette","location-on"]
    }
</script>

<style>

    :global(.layer-tab){
        padding: 0;
        height: 30px;
        width: 5px;
        border: none;
        font-size: 10pt;
    }

</style>