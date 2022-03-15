<script context="module" lang="ts">
  // retain module scoped expansion state for each tree node
  const expansionState = {}
</script>

<!--
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
 -->
<script lang="ts">
  import Checkbox from '@smui/checkbox'
  import { Icon } from '@smui/icon-button'
  import { v4 as uuidv4 } from 'uuid'

  import type { TreeNode, LayerDefinition, LayerInfo } from '../lib/types'
  import { TreeNodeInitialValues } from '../lib/constants'
  import { wtree, layerList } from '../stores/stores'
  import { map } from '../stores/mapstore'
  import { indicatorProgress } from '../stores/indicatorProgressStore'

  export let node = TreeNodeInitialValues
  export let level = 0

  const TITILER_ENDPOINT = import.meta.env.VITE_TITILER_ENDPOINT
  let checked = false

  $: tree = node
  $: ({ label, children, path, url, isRaster } = tree)
  $: expanded = expansionState[label] || false
  $: mmap = $map

  const toggleExpansion = () => {
    expanded = expansionState[label] = !expanded
    if (tree?.children.length === 0) updateTreeStore()

    setTimeout(() => {
      if ($indicatorProgress === true) $indicatorProgress = false
    }, 2000)
  }

  const updateTreeStore = async () => {
    $indicatorProgress = true
    let newTreeData = await fetchTree(tree.path)
    let subpaths = path.split('/').slice(0, -1)

    let currentTree = { ...$wtree }
    let currentTreeData: TreeNode = currentTree.tree

    subpaths.forEach((element) => {
      let currentTreeDataChildren = [...currentTreeData.children]
      if (path === newTreeData.tree.path) {
        currentTreeData.children = currentTreeDataChildren.map((item) =>
          item.path === newTreeData?.tree?.path ? newTreeData.tree : item,
        )
      }
      currentTreeData = currentTreeDataChildren.filter((item) => item.label === element).pop()
    })

    wtree.set(currentTree)
  }

  const fetchTree = async (path: string) => {
    let url = `azstorage.json?path=${path}`
    let res = await fetch(url).then((resp) => resp.json())

    return res
  }

  const loadLayer = async () => {
    $indicatorProgress = true
    const tileSourceId = path.replace(/\//g, '_')
    const layerId = uuidv4()
    let layerInfo: LayerInfo = {}

    if (checked) {
      if (!isRaster) {
        const layerName = path.split('/')[path.split('/').length - 2]
        const layerSource = {
          type: 'vector',
          tiles: [url],
          minzoom: 0,
          maxzoom: 12,
        }
        if (!(tileSourceId in mmap.getStyle().sources)) {
          $map.addSource(tileSourceId, layerSource)
        }

        const layerDefinition: LayerDefinition = {
          id: layerId,
          type: 'line',
          source: tileSourceId,
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

        layerList.set([{ name: layerName, definition: layerDefinition, type: 'vector' }, ...$layerList])
        $map.addLayer(layerDefinition)
      } else {
        const layerName = path.split('/')[path.split('/').length - 1]
        let tilejsonURL: string

        let base: string, sign: string
        ;[base, sign] = url.split('?')
        let b64_encoded_url = `${base}?${btoa(sign)}`
        let infoUrl = `${TITILER_ENDPOINT}/info?url=${b64_encoded_url}`
        layerInfo = await fetchLayerInfo(infoUrl)
        let lMin = layerInfo['band_metadata'][0][1]['STATISTICS_MINIMUM']
        let lMax = layerInfo['band_metadata'][0][1]['STATISTICS_MAXIMUM']

        tilejsonURL = `${TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?scale=1&TileMatrixSetId=WebMercatorQuad&url=${b64_encoded_url}&bidx=1&unscale=false&resampling=nearest&rescale=${lMin},${lMax}&return_mask=true&colormap_name=viridis`

        const layerSource = {
          type: 'raster',
          tiles: [tilejsonURL],
          tileSize: 256,
          bounds: layerInfo['bounds'],
          attribution:
            'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
        }
        if (!(tileSourceId in mmap.getStyle().sources)) {
          mmap.addSource(tileSourceId, layerSource)
        }
        const layerDefinition: LayerDefinition = {
          id: layerId,
          type: 'raster',
          source: tileSourceId,
          minzoom: 0,
          maxzoom: 22,
          layout: {
            visibility: 'visible',
          },
        }
        layerList.set([
          { name: layerName, definition: layerDefinition, type: 'raster', info: layerInfo },
          ...$layerList,
        ])
        let firstSymbolId = undefined
        for (const layer of $map.getStyle().layers) {
          if (layer.type === 'symbol') {
            firstSymbolId = layer.id
            break
          }
        }
        $map.addLayer(layerDefinition, firstSymbolId)
      }
    }
    $indicatorProgress = false
  }

  const fetchLayerInfo = async (url: string) => {
    return await fetch(url).then((response) => response.json())
  }
</script>

<li style="padding-left:{level * 1}rem;">
  <div style=" padding-top: 5px;">
    {#if children}
      <div on:click={() => toggleExpansion()} class="node-container">
        <div class="tree-icon">
          {#if !expanded}
            <Icon color="primary" class="material-icons" on>chevron_right</Icon>
          {:else}
            <Icon color="primary" class="material-icons" on style="transform: rotate(90deg);">chevron_right</Icon>
          {/if}
        </div>

        {#if url}
          <div class="icon vector">
            {@html '&#10070'}
          </div>

          <div alt="Vector" class="checkbox">
            <Checkbox
              bind:checked
              on:change={() => loadLayer()}
              style="background-color: transparent; --mdc-ripple-fg-size:0;" />
          </div>
        {/if}

        <div class="name">
          {label}
        </div>
      </div>
    {:else}
      <div class="node-container">
        {#if isRaster}
          <div class="icon raster">
            {@html '&#9638'}
          </div>

          <div alt="Raster" class="checkbox">
            <Checkbox
              bind:checked
              on:change={() => loadLayer()}
              style="background-color: transparent; --mdc-ripple-fg-size:0;"
              id={label} />
          </div>
        {/if}
        <div class="name">
          {label}
        </div>
      </div>
    {/if}
  </div>
</li>

{#if expanded && children}
  {#each children as child}
    <svelte:self node={child} level={level + 1} />
  {/each}
{/if}

<style lang="scss">
  .checkbox {
    transform: scale(0.75);
  }

  .node-container {
    display: flex;
    justify-content: left;
    align-items: center;
    height: 20px;
  }

  .icon {
    &.raster {
      color: rgb(52, 152, 219);
    }

    &.vector {
      color: rgb(0, 255, 0);
    }
  }

  .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
