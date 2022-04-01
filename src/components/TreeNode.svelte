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
  import { onMount } from 'svelte'
  import { slide } from 'svelte/transition'
  import Checkbox from '@smui/checkbox'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { v4 as uuidv4 } from 'uuid'
  import Fa from 'svelte-fa'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'

  import type { TreeNode, LayerInfo } from '../lib/types'
  import type { RasterLayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerIconTypes, TreeNodeInitialValues, LayerTypes, DEFAULT_COLORMAP } from '../lib/constants'
  import { map, dynamicLayers, layerList, indicatorProgress, wtree } from '../stores'
  import SelectLayerStyleDialog from './controls/SelectLayerStyleDialog.svelte'

  export let node = TreeNodeInitialValues
  export let level = 0
  export let handlErrorCallback: CallableFunction
  let SelectLayerStyleDialogVisible
  let IsCanceledAddingLayer

  const titilerApiUrl = import.meta.env.VITE_TITILER_ENDPOINT
  const iconRaster = LayerIconTypes.find((icon) => icon.id === LayerTypes.RASTER)
  const iconVector = LayerIconTypes.find((icon) => icon.id === LayerTypes.VECTOR)
  let loadingLayer = false

  $: tree = node
  $: ({ label, children, path, url, isRaster } = tree)
  $: expanded = expansionState[label] || false
  $: mmap = $map
  $: checked = $layerList.filter((item) => item.definition.source === path).length === 1 ? true : false

  onMount(() => {
    if (level === 0) toggleExpansion()

    if (level > 0) {
      const layer = $layerList.find((layer) => layer.definition.source === path)
      if (layer) checked = true
    }
  })

  const toggleExpansion = () => {
    expanded = expansionState[label] = !expanded
    if (tree?.children.length === 0) updateTreeStore()

    setTimeout(() => {
      if (loadingLayer === true) {
        loadingLayer = false
      }
    }, 2000)
  }

  const updateTreeStore = async () => {
    loadingLayer = true
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
      currentTreeData = currentTreeDataChildren.find((item) => item.label === element)
    })

    wtree.set(currentTree)
    loadingLayer = false
  }

  const fetchTree = async (path: string) => {
    let url = `azstorage.json?path=${path}`
    let res = await fetch(url).then((resp) => resp.json())

    return res
  }

  const paramsToQueryString = (params: any) => {
    return Object.keys(params)
      .map((key) => key + '=' + params[key])
      .join('&')
  }

  const loadLayer = async (event) => {
    $indicatorProgress = true
    if (event.target.checked) {
      const tileSourceId = path
      const layerId = uuidv4()
      let layerInfo: LayerInfo = {}

      if (!isRaster) {
        SelectLayerStyleDialogVisible = true
      } else {
        const layerName = path.split('/')[path.split('/').length - 1]
        const [base, sign] = url.split('?')
        const b64EncodedUrl = `${base}?${btoa(sign)}`
        const infoUrl = `${titilerApiUrl}/fullinfo?url=${b64EncodedUrl}`
        layerInfo = await fetchLayerInfo(infoUrl)

        const layerBandMetadataMin = layerInfo['band_metadata'][0][1]['STATISTICS_MINIMUM']
        const layerBandMetadataMax = layerInfo['band_metadata'][0][1]['STATISTICS_MAXIMUM']

        if (layerBandMetadataMin && layerBandMetadataMax) {
          const titilerApiUrlParams = {
            scale: 1,
            TileMatrixSetId: 'WebMercatorQuad',
            url: b64EncodedUrl,
            bidx: 1,
            unscale: false,
            resampling: 'nearest',
            rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
            return_mask: true,
            colormap_name: DEFAULT_COLORMAP,
          }

          const layerSource = {
            type: LayerTypes.RASTER,
            tiles: [`${titilerApiUrl}/tiles/{z}/{x}/{y}.png?${paramsToQueryString(titilerApiUrlParams)}`],
            tileSize: 256,
            bounds: layerInfo['bounds'],
            attribution:
              'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
              Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
          }

          if (!(tileSourceId in mmap.getStyle().sources)) {
            mmap.addSource(tileSourceId, layerSource)
          }

          const layerDefinition: RasterLayerSpecification = {
            id: layerId,
            type: LayerTypes.RASTER,
            source: tileSourceId,
            minzoom: 0,
            maxzoom: 22,
            layout: {
              visibility: 'visible',
            },
          }

          $layerList = [
            {
              name: layerName,
              definition: layerDefinition,
              type: LayerTypes.RASTER,
              info: layerInfo,
              visible: true,
              url: b64EncodedUrl,
            },
            ...$layerList,
          ]
          let firstSymbolId = undefined
          for (const layer of $map.getStyle().layers) {
            if (layer.type === 'symbol') {
              firstSymbolId = layer.id
              break
            }
          }
          $map.addLayer(layerDefinition, firstSymbolId)
        } else {
          handlErrorCallback({
            code: 'UNDEFINED_BAND_METADATA_LAYER_MINMAX',
          })
        }
      }
    } else {
      const layerToBeRemoved = $layerList.find((item) => item.definition.source === path)

      if (layerToBeRemoved) {
        $map.removeLayer(layerToBeRemoved.definition.id)
        $layerList = $layerList.filter((item) => item !== layerToBeRemoved)
        $dynamicLayers = $dynamicLayers.filter((dynamicLayerId) => dynamicLayerId !== layerToBeRemoved.definition.id)
      }
    }
    $indicatorProgress = false
  }

  const fetchLayerInfo = async (url: string) => {
    return await fetch(url).then((response) => response.json())
  }
</script>

<li style="padding-left:{level * 0.75}rem;">
  <div style="padding-top: 5px;">
    {#if children}
      <div
        on:click={() => (level > 0 ? toggleExpansion() : '')}
        class="node-container"
        transition:slide={{ duration: expanded ? 0 : 350 }}>
        <div class="tree-icon">
          {#if loadingLayer === true}
            <Fa icon={faSync} size="sm" spin />
          {:else if level === 0}
            <Fa icon={faDatabase} size="sm" />
          {:else if !expanded}
            <Fa icon={faChevronRight} size="sm" style="cursor: pointer;" />
          {:else}
            <Fa icon={faChevronRight} size="sm" style="cursor: pointer; transform: rotate(90deg);" />
          {/if}
        </div>

        {#if url}
          <div alt="Vector" class="checkbox">
            <Checkbox
              {checked}
              on:change={loadLayer}
              value={path}
              style="background-color: transparent; --mdc-ripple-fg-size:0;"
              id={label} />
          </div>
        {/if}

        <div class={url ? 'name vector' : 'name'}>
          {label}
        </div>

        {#if url}
          <div class="icon" alt={iconVector.label} title={iconVector.label}>
            <Wrapper>
              <Fa icon={iconVector.icon} size="sm" primaryColor={iconVector.color} />
              <Tooltip yPos="above">Vector</Tooltip>
            </Wrapper>
          </div>
        {/if}
      </div>
    {:else}
      <div class="node-container">
        {#if isRaster}
          <div alt="Raster" class="checkbox">
            <Checkbox
              {checked}
              on:change={loadLayer}
              value={path}
              style="background-color: transparent; --mdc-ripple-fg-size:0;"
              id={label} />
          </div>
        {/if}

        <div class={isRaster ? 'name raster' : 'name'}>
          {label}
        </div>

        {#if isRaster}
          <div class="icon" alt={iconRaster.label} title={iconRaster.label}>
            <Wrapper>
              <Fa icon={iconRaster.icon} size="sm" primaryColor={iconRaster.color} />
              <Tooltip yPos="above">Raster</Tooltip>
            </Wrapper>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</li>

{#if expanded && children}
  {#each children as child}
    <svelte:self node={child} level={level + 1} {handlErrorCallback} />
  {/each}
{/if}

<SelectLayerStyleDialog bind:SelectLayerStyleDialogVisible bind:IsCanceledAddingLayer {path} {url} {label} />

<style lang="scss">
  .node-container {
    display: flex;
    justify-content: left;
    align-items: center;
    height: 22px;

    .checkbox {
      transform: scale(0.75);
    }

    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: 5px;
      height: 19.5px;
      width: 100%;

      @media (prefers-color-scheme: dark) {
        color: white;
      }
    }

    .icon {
      padding-right: 10px;
      padding-left: 10px;
      cursor: pointer;
    }

    .tree-icon {
      margin-right: 5px;

      @media (prefers-color-scheme: dark) {
        color: white;
      }
    }
  }
</style>
