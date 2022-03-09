<script context="module" lang="ts">
	

    // retain module scoped expansion state for each tree node
    const _expansionState = {
        /* treeNodeId: expanded <boolean> */
    };
   
   


</script>
<script lang="ts">
    import { onMount } from 'svelte';
    import { v4 as uuidv4 } from 'uuid';
    import {wtree,  layerList} from '../stores/stores'
    import { map } from '../stores/mapstore';
    
    let TITILER_ENDPOINT;
    
    const fetchTitilerConfig = async() => {
        let url = `titiler.json`;
        let res = await fetch(url).then((resp) => resp.json())
        return res.TITILER_ENDPOINT;
    };

    const fetchLayerStats = async(url) => {

        let res = await fetch(url).then((response) => response.json());
        return res;
    }

    const fetchLayerBounds = async(url) => {

        return await fetch(url).then((response) => response.json());
        
}

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
            this cretaestree an identical node with the current one with exception that its children are fetched
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
            //set  root for next level of iteration
            let nextRoot = echildren.filter(item => item.label == element).pop();


            root = nextRoot;


        });

    };

    $:mmap = $map;

    export let tree;


    export let label, children, path, url, isRaster;
    $: ({ label, children, path, url, isRaster } = tree)

    // const {label, children, path} = tree;

    export let expanded;
    $:expanded = _expansionState[label] || false;

    onMount( async() => {

        //console.log('Mounting TW', _expansionState);
        TITILER_ENDPOINT = await fetchTitilerConfig()
    });
    let icon = '&#43';

    const loadLayer = async() => {
        const srcId = path.replace(/\//g,'_');
        //console.log(path, srcId);
        const lid = uuidv4();
        let lStats = {};
        let lBounds = [];
        if (!checked){

            if (!isRaster){
                const lName  = path.split('/')[path.split('/').length-2]; 
                console.log('load vector layer ', label, url);
                const lSrc = {
                            'type': 'vector',
                            'tiles': [url],
                            'minzoom': 0,
                            'maxzoom': 12
                        };
                if(! (srcId in mmap.getStyle().sources)){
                    $map.addSource(srcId,lSrc);
                }
                
                const lDef = {

                    'id': lid, // Layer ID
                    'type': 'line',
                    'source': srcId, // ID of the tile source created above
                    'source-layer': label,
                    'layout': {
                            'visibility':'visible',
                            'line-cap': 'round',
                            'line-join': 'round'
                            },
                    'paint': {
                        'line-color': 'rgb(53, 175, 109)',
                        'line-width': 0.5
                    }
                };
                let lNames = $layerList.map(item => { return item.lName});

                if (lNames.includes(lName)){

                    dialogOpen = true;


                }
                console.log($layerList);
                layerList.set([{'lName':lName,  'lDef':lDef, 'lType':'vector', 'lStats':{}},...$layerList ]);
                console.log($layerList);    
                $map.addLayer( lDef);
            }
            else{ //
                const lName  = path.split('/')[path.split('/').length-1]; 
                //console.log('load raster layer', label, url)
                let tilejsonURL;
                

                let base, sign;
                [base,sign] = url.split('?');
                let b64_encoded_url  = `${base}?${btoa(sign)}`;
                //console.log(`${b64_encoded_url}`);
                let statUrl = `${TITILER_ENDPOINT}/statistics?url=${b64_encoded_url}&bidx=1&unscale=false&resampling=nearest&max_size=1024&categorical=false&p=5&p=95&p=98&p=2`
                let boundsUrl = `${TITILER_ENDPOINT}/bounds?url=${b64_encoded_url}`
                
                //tilejsonURL = `${TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?scale=1&TileMatrixSetId=WebMercatorQuad&url=${base}&url_params=${btoa(sign)}&bidx=1&unscale=false&resampling=nearest&rescale=0,1&colormap_name=inferno&return_mask=true`;
                lStats = await fetchLayerStats(statUrl);
                lBounds = await fetchLayerBounds(boundsUrl);
                //console.log(lBounds['bounds']);

                let lMin = lStats["1"]["min"]
                let lMax = lStats["1"]["max"]
                //console.log(`Stats ${lMax} ${lMin}`);
                tilejsonURL = `${TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?scale=1&TileMatrixSetId=WebMercatorQuad&url=${b64_encoded_url}&bidx=1&unscale=false&resampling=nearest&rescale=${lMin},${lMax}&colormap_name=viridis&return_mask=true`;
                
            
                
                
                //console.log('tit', tilejsonURL);
                const lSrc = {
                    'type': 'raster',
                    'tiles': [tilejsonURL],         
                    'tileSize': 256,
                    'bounds':lBounds['bounds'],
                    'attribution':'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
                };
                //console.log( mmap.getStyle().sources);
                if(! (srcId in mmap.getStyle().sources)){
                    mmap.addSource(srcId,lSrc);
                }
                //console.log( mmap.getStyle().sources);
                const lDef = {
                    
                        'id': lid,
                        'type': 'raster',
                        'source': srcId,
                        'minzoom': 0,
                        'maxzoom': 22,
                        'layout': {
                            'visibility':'visible'
                            
                            },


                };

                let lNames = $layerList.map(item => { return item.lName});
                if (lNames.includes(lName)){

                    let contin = confirm(`Are you sure you want to add ${lName} `);


                }
                //console.log($layerList);
                layerList.set([{'lName':lName, 'lDef':lDef, 'lType':'raster', 'lStats':lStats}, ...$layerList ]);
                let firstSymbolId = undefined;
                for (const layer of $map.getStyle().layers) {
                    if (layer.type === 'symbol') {
                        firstSymbolId = layer.id;
                        break;
                    }
                }
                console.log(`LL: ${JSON.stringify($layerList, null, '\t')}`);
                $map.addLayer(lDef, firstSymbolId);
            }
            
            
            
        }
        // else {
        //     //nothing to do here
        //     //console.log('removed layer', label)
        // }
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



    let dialogOpen = false;
    let confirmValue = 'Nothing yet.'


    
</script>


<ul><!-- transition:slide -->
    <li>
        {#if children}


			<span on:click={() => toggleExpansion()}>
				<span class="arrow" class:arrowDown > {@html icon} </span>
                {label}

			</span>
            <span alt="Vector tile layer" style="color: lime;">
                {#if url}
                    {@html '&#10070'}
                    <input style="padding:0px; margin:0px" type=checkbox on:change={()=>loadLayer()} bind:checked />
                {/if}
            </span>

            {#if expanded}
                {#each children as child}
                    <svelte:self tree={child} />
                    <!-- <svelte:self bind:tree={child} /> -->
                {/each}
            {/if}
        {:else}



			<span >
                <span data-tooltip="Vector tile layer" style="color: rgb(52, 152, 219);">
                    {#if isRaster}
                        {@html '&#9638'}
                        <input style="padding:0px; margin:0px" type=checkbox on:change={()=>loadLayer()} bind:checked />
                    {/if}
                </span>
                <!-- <a href="" data-tooltip="Vector tile layer" style="color: rgb(52, 152, 219);" >{#if isRaster}{@html '&#10070'}{/if}</a> -->
                <!-- <span class="no-arrow" on:click={() => toggleExpansion(label)}>{label}</span> -->

                {label}



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