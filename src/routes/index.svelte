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

<script lang="ts">
    import {wtree}  from '../stores/stores'
    import TreeView from './TreeView.svelte'
    
    export let tree = undefined;

    
    wtree.update(t=>tree);
    
    


</script>

    <div>
        
        
        <TreeView tree={$wtree.tree} />
        

    </div>
    
<style>
    
</style>