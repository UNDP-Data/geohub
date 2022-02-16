<script context="module" lang="ts">
    // retain module scoped expansion state for each tree node
    const _expansionState = {
        /* treeNodeId: expanded <boolean> */
    };
    

</script>
<script lang="ts">

    import {wtree} from '../stores/stores'
    
    const fetchTree = async(prefix:string) => { 
        let url = `azstorage.json?prefix=${prefix}`;
        let res = await fetch(url).then((resp) => resp.json())

        return res;
    };

    const updateTree = (oldTree:any, newTree:any) => {
        console.log(oldTree.label, newTree.label);
        

    };

    
    import Checkbox from '@smui/checkbox';
    
    //	import { slide } from 'svelte/transition'
    export let tree:any;
    // $:mtree = tree;
    const {label, children, path} = tree;
    

    let expanded = _expansionState[label] || false;

    let icon = '&#43';
    
    const loadLayer = (label:string, path:string) => {
        if (!checked){
            console.log('load layer ', label, path);
        }
        else {
            console.log('remove layer', label)
        }
    };

    const toggleExpansion = async (tree:any) => {
            expanded = _expansionState[label] = !expanded;
            // console.log(label, path, tree.children.length);
        
            if (tree.children.length> 0){
                console.log(`Nothing to do on ${label}`);
                
                
            }
            else {
                
                

                console.log('before', tree);
                let newTree = await fetchTree(tree.path);
                console.log('after', newTree.tree);
                
                //test

                //$wtree = {...$wtree.children, ...newTree.tree }
                //console.log(uptree);
                $wtree = newTree;
                console.log($wtree);
                
            }
        }
        
   
        
        
    
    $: arrowDown = expanded;
    $: icon = expanded ? '&#8722':'&#43';
    let checked: boolean = false;
</script>

<ul><!-- transition:slide -->
    <li>
        {#if children}
			<span on:click={() => toggleExpansion(tree)}>
			<!-- <span on:click={() => {tree = toggleExpansion(tree)}}> -->
				<!-- <span class="arrow" class:arrowDown>&#x25b6</span> -->
				<span class="arrow" class:arrowDown > {@html icon} </span>
                {label}
			</span>
            {#if expanded}
                {#each children as child}
                    <svelte:self tree={child} />
                {/each}
            {/if}
        {:else}
            
                
            
			<span >
				<!-- <span class="no-arrow" on:click={() => toggleExpansion(label)}>{label}</span> -->
                <input style="padding:0px, margin:0px" type=checkbox on:change={()=>loadLayer(label, path)} bind:checked /> {label}
                
                
                <!-- <a href="{path}">{label}</a> -->
                
			</span>
        {/if}
    </li>
</ul>

<style>
    ul {
        margin: 0;
        list-style: none;
        padding-left: 1.2rem;
        user-select: none;
    }
    .no-arrow { padding-left: 1.0rem; }
    .arrow {
        cursor: pointer;
        display: inline-block;
        /* transition: transform 200ms; */
    }
    .arrowDown { transform: rotate(180deg); }
</style>