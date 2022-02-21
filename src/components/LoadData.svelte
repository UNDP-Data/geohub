<script context="module" lang='ts'>
    
    export async function load({fetch}) {
        
        const res = await fetch("../routes/azstorage.json");

        const tree = await res.json();
        
        return {
           props: {
               tree
           }
        }
    }
    
</script>


<script lang=ts>

import {wtree}  from '../stores/stores'
import TreeView from './TreeView.svelte'
    
export let tree = undefined;

    
wtree.update(t=>tree);

console.log('JUSSI', tree);

// import TreeView from './TreeView.svelte1'

const stree = {
    label: "USA", children: [
        {label: "Florida", children: [
                {label: "Jacksonville"},
                {label: "Orlando", children: [
                        {label: "Disney World"},
                        {label: "Universal Studio"},
                        {label: "Sea World"},
                    ]},
                {label: "Miami"},
            ]},
        {label: "California", children: [
                {label: "San Francisco"},
                {label: "Los Angeles"},
                {label: "Sacramento"},
            ]},
    ],
}
</script>

<div >
    <TreeView tree={stree} />
</div>

<style id="load-data-div">
    #load-data-div{
        margin-top: 10px;
    }
</style>