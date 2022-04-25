<script context="module" lang="ts">
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
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { v4 as uuidv4 } from 'uuid'
  import Fa from 'svelte-fa'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
  import { faCirclePlus } from '@fortawesome/free-solid-svg-icons/faCirclePlus'
  import type { RasterLayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import type { BannerMessage, TreeNode, LayerInfo } from '$lib/types'
  import {
    ErrorMessages,
    LayerIconTypes,
    TreeNodeInitialValues,
    LayerTypes,
    StatusTypes,
    DEFAULT_COLORMAP,
  } from '$lib/constants'
  import { fetchUrl } from '$lib/helper'
  import { map, layerList, indicatorProgress, bannerMessages, wtree } from '$stores'
  import SelectLayerStyleDialog from '$components/controls/SelectLayerStyleDialog.svelte'

  export let node = TreeNodeInitialValues
  export let level = 0
  let SelectLayerStyleDialogVisible: boolean

  const titilerApiUrl = import.meta.env.VITE_TITILER_ENDPOINT
  const iconRaster = LayerIconTypes.find((icon) => icon.id === LayerTypes.RASTER)
  const iconVector = LayerIconTypes.find((icon) => icon.id === LayerTypes.VECTOR)
  let loadingLayer = false

  $: tree = node
  $: ({ label, children, path, url, isRaster } = tree)
  $: expanded = expansionState[label] || false
  $: mmap = $map

  onMount(() => {
    if (level === 0) toggleExpansion()
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
    const treeData = await fetchUrl(`azstorage.json?path=${tree.path}`)

    if (treeData) {
      const subpaths = path.split('/').slice(0, -1)
      let currentTree = { ...$wtree }
      let currentTreeData: TreeNode = currentTree.tree

      subpaths.forEach((element) => {
        let currentTreeDataChildren = [...currentTreeData.children]
        if (path === treeData.tree.path) {
          currentTreeData.children = currentTreeDataChildren.map((item) =>
            item.path === treeData?.tree?.path ? treeData.tree : item,
          )
        }
        currentTreeData = currentTreeDataChildren.find((item) => item.label === element)
      })

      wtree.set(currentTree)
    }

    loadingLayer = false
  }

  const paramsToQueryString = (params: Record<string, unknown>) => {
    return Object.keys(params)
      .map((key) => key + '=' + params[key])
      .join('&')
  }

  const loadLayer = async () => {
    $indicatorProgress = true
    loadingLayer = true

    const tileSourceId = path
    const layerId = uuidv4()
    let layerInfo: LayerInfo = {}

    if (!isRaster) {
      SelectLayerStyleDialogVisible = true
    } else {
      const layerName = path.split('/')[path.split('/').length - 1]
      const [base, sign] = url.split('?')
      const b64EncodedUrl = `${base}?${btoa(sign)}`
      layerInfo = await fetchUrl(`${titilerApiUrl}/info?url=${b64EncodedUrl}`)

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
        const bannerErrorMessage: BannerMessage = {
          type: StatusTypes.INFO,
          title: 'Whoops! Something went wrong.',
          message: ErrorMessages.UNDEFINED_BAND_METADATA_LAYER_MINMAX,
        }
        $bannerMessages = [...$bannerMessages, ...[bannerErrorMessage]]
      }
    }

    $indicatorProgress = false

    setTimeout(function () {
      loadingLayer = false
    }, 350)
  }
</script>

<li style="padding-left:{level * 0.75}rem;">
  <div style="padding-top: 5px;">
    {#if children}
      <div class="node-container" transition:slide={{ duration: expanded ? 0 : 350 }}>
        <div class="tree-icon" on:click={() => (level > 0 ? toggleExpansion() : '')}>
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
          <div alt="Vector" class="load-layer" on:click={loadLayer}>
            {#if loadingLayer === true}
              <Fa icon={faSync} size="sm" spin />
            {:else}
              <Wrapper>
                <Fa icon={faCirclePlus} size="sm" style="cursor: pointer;" />
                <Tooltip showDelay={0} hideDelay={100} yPos="above">Add Layer</Tooltip>
              </Wrapper>
            {/if}
          </div>
        {/if}

        <div class={url ? 'name vector' : 'name'}>
          {label}
        </div>

        {#if url}
          <div class="icon" alt={iconVector.label} title={iconVector.label}>
            <Wrapper>
              <Fa icon={iconVector.icon} size="sm" primaryColor={iconVector.color} />
              <Tooltip showDelay={0} hideDelay={100} yPos="above">Vector</Tooltip>
            </Wrapper>
          </div>
        {/if}
      </div>
    {:else}
      <div class="node-container">
        {#if isRaster}
          <div alt="Raster" class="load-layer" on:click={loadLayer}>
            {#if loadingLayer === true}
              <Fa icon={faSync} size="sm" spin />
            {:else}
              <Wrapper>
                <Fa icon={faCirclePlus} size="sm" style="cursor: pointer;" />
                <Tooltip showDelay={0} hideDelay={100} yPos="above">Add Layer</Tooltip>
              </Wrapper>
            {/if}
          </div>
        {/if}

        <div class={isRaster ? 'name raster' : 'name'}>
          {label}
        </div>

        {#if isRaster}
          <div class="icon" alt={iconRaster.label} title={iconRaster.label}>
            <Wrapper>
              <Fa icon={iconRaster.icon} size="sm" primaryColor={iconRaster.color} />
              <Tooltip showDelay={0} hideDelay={100} yPos="above">Raster</Tooltip>
            </Wrapper>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</li>

{#if expanded && children}
  {#each children as child}
    <svelte:self node={child} level={level + 1} />
  {/each}
{/if}

<SelectLayerStyleDialog bind:SelectLayerStyleDialogVisible {path} {url} {label} />

<style lang="scss">
  .node-container {
    align-items: center;
    display: flex;
    height: 22px;
    justify-content: left;

    .load-layer {
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }

    .name {
      height: 19.5px;
      overflow: hidden;
      padding-left: 5px;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;

      @media (prefers-color-scheme: dark) {
        color: white;
      }
    }

    .icon {
      cursor: pointer;
      padding-left: 10px;
      padding-right: 10px;
    }

    .tree-icon {
      margin-right: 5px;

      @media (prefers-color-scheme: dark) {
        color: white;
      }
    }
  }
</style>
