
<script context="module">
    
    export async function load({fetch}) {
        
        const res = await fetch("azstorage.json")

        const tree = await res.json()
        
        return {
           props: {
               tree
           }
        }
    }
    
</script>

<!-- <script lang="ts">
    import {wtree}  from '../stores/stores'
    import TreeView from './TreeView.svelte'
    
    export let tree = undefined;

    
    wtree.update(t=>tree);
    
    

</script>

<div>
    
    
    <TreeView tree={$wtree.tree} />
    

</div> -->
    

<!-- Todo: This styles are set to ensure that the Map Content moves together with the drawer opening-->
<style global>
    .mdc-drawer{
        width:250px;
    }

    .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content{
        margin-left: 250px;
        margin-right: 0;
    }
</style>


