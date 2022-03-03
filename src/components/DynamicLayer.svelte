<script lang="ts" context="module">
	
    const _layerState = {
        /* treeNodeId: expanded <boolean> */
    };
    const _sectionState = {
        /* treeNodeId: expanded <boolean> */
    };
</script>

<script lang="ts">
	
    import Accordion, { Panel, Header, Content } from '@smui-extra/accordion';
    export let panelOpen:boolean = false;
</script>

<Accordion>
    <Panel variant='unelevated' color="primary" bind:open={panelOpen}>
        <Header style="padding:5px">
            DynamicLayer
        </Header>
        
        <Content>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Molestias, quis?
        </Content>
    </Panel>
</Accordion>


<style>
    .layer-header-name {
        display: flex;
        align-self:center;
        flex: 0 0 1; 
        /* width: 100%; */
        justify-content: center;
        /* flex-wrap: nowrap;
        overflow-wrap:anywhere; */
    }
    .layer-name{
        
        display: flex;
        cursor:pointer;
        font-family: Roboto,serif;
        width: 100%;
        min-height: 2.5rem;
        height:auto;
        font-size: 16pt;
        font-weight: bold;
        justify-content: center;
        align-items: center;
        width: fit-content;
        
        
    }


    :global(.smui-accordion__header){
        padding: 0!important;
    }
    :global(.smui-accordion__panel){
        padding: 0!important;
    }
    
</style>

