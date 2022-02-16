<script context="module">
    
    export async function load({fetch}) {
        
        const res = await fetch("azstorage.json")

        const tree = await res.json()
        console.log(`fetched ${tree}`, tree)
        return {
           props: {
               tree
           }
        }
    }
    
</script>

<script lang="ts">
    import {wtree}  from '../stores/stores'
    import TreeView from './TreeView.svelte'
    
    export let tree = undefined;

    console.log($wtree);
    wtree.update(t=>tree);
    
    

</script>

    <div>
        No of children in tree  is {$wtree.tree.children.length}
        
        <TreeView bind:tree={$wtree.tree} />

    </div>
<style>
    
</style>