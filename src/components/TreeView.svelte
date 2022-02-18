<script context="module" lang="ts">
    // retain module scoped expansion state for each tree node
    const _expansionState = {
        /* treeNodeId: expanded <boolean> */
    };
    

</script>
<script lang="ts">

    import {wtree} from '../stores/stores'
    
    const fetchTree = async(path:string) => { 
        let url = `azstorage.json?path=${path}`;
        let res = await fetch(url).then((resp) => resp.json())

        return res;
    };

    /*
    
    Update the JSON based data structure that power the tree view (this) component
    The general idea of the update is:
    0. the tree is initialized with data, and is destructured into its mains props
       Very imp, the variables that are created in the descructuring are reactive:

            let label, children, path, url, isRaster;
            $: ({ label, children, path, url, isRaster } = tree)

    1. User clicks on a tree node
    2. toggleExpansion is called:
        a) id the ndoe has children nothing happens, else the fucntion continues
        b) the current node path prop is used to fethc the children for the current node from the endpoint
            this cretaes an identical node with the current one with exception that its children are fetched
        c) a new copy of the tree is is created by descructuring the old tree
        d) the copy is updated  inside updateTree 
        e) the updated copy is wriiten into the store so  other componnets are notified
        f) the parent component updates the current
        g) the TreeView componnet 
            let label, children, path, url, isRaster;
            $: ({ label, children, path, url, isRaster } = tree)


    
    */
    
    const updateTree = ( oldTree:any, child:any) => {
        //split the current path (where user clicked into subpaths ) /a/b/c => ['a','b','c']
        let subpaths:[] = path.split('/').slice(0,-1);
        //fetch the old tree and set it to root 
        let root = oldTree.tree
        //iterate over 
        subpaths.forEach(element => {
            //fetch children
            let echildren = [...root.children];
            // extract cpath property from children into an array
            let paths = echildren.map(item => { return item.path});
            // check if the global path (where user clicked) equals the new child tree's path  
            
            if (path == child.tree.path){ // this is the root subpath where the new child should be inserted into roots children                
                let updatedChildren  = echildren.map(
                             item => { return item.path == child.tree.path ? child.tree : item }
                        );
                //replace old children with updated
                root.children = updatedChildren;        
            }
            //set ne root for next level of iteration
            let nextRoot = echildren.filter(item => item.label == element).pop();
            // if (!nextRoot){
            //     return;
            // }
            
            
            root = nextRoot;

            
        });
        
    };

    
    import Checkbox from '@smui/checkbox';
    
    //	import { slide } from 'svelte/transition'
    export let tree:any;
    
    let label, children, path, url, isRaster;
    $: ({ label, children, path, url, isRaster } = tree)

    // const {label, children, path} = tree;
    

    let expanded = _expansionState[label] || false;

    let icon = '&#43';
    
    const loadLayer = () => {
        if (!checked){
            console.log('load layer ', label, url);
        }
        else {
            console.log('remove layer', label)
        }
    };

    const toggleExpansion = async () => {
            
            expanded = _expansionState[label] = !expanded;
            
            
            if (tree.children.length> 0){
                // console.log(`Nothing to do on ${label}`);
                return;
                
            }
            else {
                // fetch 
                // console.log('before', tree);
                let newTree = await fetchTree(tree.path);
                // console.log('after', newTree.tree);
                
                let treeToUpdate = {...$wtree};
                
                updateTree(treeToUpdate,newTree);
                
                wtree.set(treeToUpdate) ;
                
            }
        }
        
   
        
        
    
    $: arrowDown = expanded;
    $: icon = expanded ? '&#8722':'&#43';
    let checked: boolean = false;
    
    
    
        
    
    
    
</script>

<ul><!-- transition:slide -->
    <li>
        {#if children}
        


			<span on:click={() => toggleExpansion()}>
                
                <span alt="Vector tile layer" style="color: lime;">{#if url}{@html '&#10070'}{/if}</span> 

                
			<!-- <span on:click={() => {tree = toggleExpansion(tree)}}> -->
				<!-- <span class="arrow" class:arrowDown>&#x25b6</span> -->
				<span class="arrow" class:arrowDown > {@html icon} </span>
                {label}{#if url} - <a href="{url}">web url</a>{/if}
			</span>
            {#if expanded}
                {#each children as child}
                    <svelte:self tree={child} />
                    <!-- <svelte:self bind:tree={child} /> -->
                {/each}
            {/if}
        {:else}
            
                
            
			<span >
                <span data-tooltip="Vector tile layer" style="color: rgb(52, 152, 219);">{#if isRaster}{@html '&#9638'}{/if}</span>
                <!-- <a href="" data-tooltip="Vector tile layer" style="color: rgb(52, 152, 219);" >{#if isRaster}{@html '&#10070'}{/if}</a> -->
				<!-- <span class="no-arrow" on:click={() => toggleExpansion(label)}>{label}</span> -->
                <input style="padding:0px, margin:0px" type=checkbox on:change={()=>loadLayer()} bind:checked />
                {label}
                
                
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
    
    .arrow {
        cursor: pointer;
        display: inline-block;
        /* transition: transform 200ms; */
    }
    .arrowDown { transform: rotate(180deg); }
</style>