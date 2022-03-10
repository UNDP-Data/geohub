<script context="module" lang="ts">
  // retain module scoped expansion state for each tree node
  const _expansionState = {}
</script>
<script lang="ts">
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

  import { v4 as uuidv4 } from 'uuid'
  import { wtree, layerList } from '../stores/stores'
  import { map } from '../stores/mapstore'

  export let tree = {
    label: 'GeoHub Azure Storage',
    children: [],
    path: '/',
    url: null,
    isRaster: false,
  }

  let icon = '&#43'
  let checked = false

  $: arrowDown = expanded
  $: expanded = _expansionState[label] || false
  $: icon = expanded ? '&#8722' : '&#43'
  $: mmap = $map
  $: ({ label, children, path, url, isRaster } = tree)

  const fetchTree = async (path: string) => {
    let url = `azstorage.json?path=${path}`
    let res = await fetch(url).then((resp) => resp.json())

    return res
  }

  const updateTree = (oldTree: any, child: any) => {
    let subpaths = path.split('/').slice(0, -1)
    let root = oldTree.tree

    subpaths.forEach((element) => {
      let echildren = [...root.children]

      if (path === child.tree.path) {
        let updatedChildren = echildren.map((item) => {
          return item.path === child.tree.path ? child.tree : item
        })
        root.children = updatedChildren
      }
      let nextRoot = echildren.filter((item) => item.label === element).pop()

      root = nextRoot
    })
  }

  const loadLayer = () => {
    const srcId = path.replace(/\//g, '_')
    //     console.log(path, srcId)
    const lid = uuidv4()
    if (!checked) {
      if (!isRaster) {
        const lName = path.split('/')[path.split('/').length - 2]
        // console.log('load vector layer ', label, url)
        const lSrc = {
          type: 'vector',
          tiles: [url],
          minzoom: 0,
          maxzoom: 12,
        }
        if (!(srcId in mmap.getStyle().sources)) {
          $map.addSource(srcId, lSrc)
        }

        const lDef = {
          id: lid,
          type: 'line',
          source: srcId,
          'source-layer': label,
          layout: {
            visibility: 'visible',
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': 'rgb(53, 175, 109)',
            'line-width': 0.5,
          },
        }
        layerList.set([{ lName: lName, lDef: lDef, lType: 'vector' }, ...$layerList])
        $map.addLayer(lDef)
      } else {
        const lName = path.split('/')[path.split('/').length - 1]
        const TITILER_ENDPOINT = import.meta.env.VITE_TITILER_ENDPOINT
        let tilejsonURL: string
        let base: string, sign: string
        ;[base, sign] = url.split('?')
        tilejsonURL = `${TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?scale=1&TileMatrixSetId=WebMercatorQuad&url=${base}&url_params=${btoa(
          sign,
        )}&bidx=1&unscale=false&resampling=nearest&rescale=0,1&colormap_name=inferno&return_mask=true`

        const lSrc = {
          type: 'raster',
          tiles: [tilejsonURL],
          tileSize: 256,
          attribution:
            'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
        }
        if (!(srcId in mmap.getStyle().sources)) {
          mmap.addSource(srcId, lSrc)
        }

        const lDef = {
          id: lid,
          type: 'raster',
          source: srcId,
          minzoom: 0,
          maxzoom: 22,
          layout: {
            visibility: 'visible',
          },
        }

        layerList.set([{ lName: lName, lDef: lDef, lType: 'raster' }, ...$layerList])
        let firstSymbolId = undefined
        for (const layer of $map.getStyle().layers) {
          if (layer.type === 'symbol') {
            firstSymbolId = layer.id
            break
          }
        }
        $map.addLayer(lDef, firstSymbolId)
      }
    }
  }

  const toggleExpansion = async () => {
    expanded = _expansionState[label] = !expanded

    if (tree.children.length > 0) {
      return
    } else {
      let newTree = await fetchTree(tree.path)
      let treeToUpdate = { ...$wtree }

      updateTree(treeToUpdate, newTree)
      wtree.set(treeToUpdate)
    }
  }
</script>

<ul>
  <li>
    {#if children}
      <span on:click={() => toggleExpansion()}>
        <span class="arrow" class:arrowDown> {@html icon} </span>
        {label}
      </span>
      <span alt="Vector tile layer" style="color: lime;">
        {#if url}
          {@html '&#10070'}
          <input style="padding:0px; margin:0px" type="checkbox" on:change={() => loadLayer()} bind:checked />
        {/if}
      </span>

      {#if expanded}
        {#each children as child}
          <svelte:self tree={child} />
        {/each}
      {/if}
    {:else}
      <span>
        <span data-tooltip="Vector tile layer" style="color: rgb(52, 152, 219);">
          {#if isRaster}
            {@html '&#9638'}
            <input style="padding:0px; margin:0px" type="checkbox" on:change={() => loadLayer()} bind:checked />
          {/if}
        </span>
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
  }
  .arrowDown {
    transform: rotate(180deg);
  }
</style>
