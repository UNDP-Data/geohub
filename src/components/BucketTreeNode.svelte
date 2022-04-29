<script context="module" lang="ts">
  const expansionState = {}
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { v4 as uuidv4 } from 'uuid'
  import Fa from 'svelte-fa'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faCirclePlus } from '@fortawesome/free-solid-svg-icons/faCirclePlus'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
  import { faWindowClose } from '@fortawesome/free-solid-svg-icons/faWindowClose'

  import type { RasterLayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { createPopperActions } from 'svelte-popperjs'
  import { cloneDeep } from 'lodash-es'

  import SelectLayerStyleDialog from '$components/controls/SelectLayerStyleDialog.svelte'
  import { ErrorMessages, LayerIconTypes, LayerTypes, StatusTypes, DEFAULT_COLORMAP } from '$lib/constants'
  import { fetchUrl, hash, clean, downloadFile } from '$lib/helper'
  import type { BannerMessage, TreeNode, LayerInfo, LayerInfoMetadata } from '$lib/types'
  import { map, layerList, layerMetadata, indicatorProgress, bannerMessages } from '$stores'

  export let level = 0
  export let node: TreeNode

  const dispatch = createEventDispatcher()
  const iconRaster = LayerIconTypes.find((icon) => icon.id === LayerTypes.RASTER)
  const iconVector = LayerIconTypes.find((icon) => icon.id === LayerTypes.VECTOR)
  const titilerApiUrl = import.meta.env.VITE_TITILER_ENDPOINT

  let layerInfoMetadata: LayerInfoMetadata
  let loadingLayer = false
  let SelectLayerStyleDialogVisible: boolean
  let showTooltip = false
  let tooltipTimer: ReturnType<typeof setTimeout>

  $: tree = node
  $: ({ label, children, path, url, isRaster } = tree)
  $: expanded = expansionState[label] || false
  $: mmap = $map

  onMount(() => {
    console.log({ label: label, path: path, url: url })
    if (level === 0) toggleExpansion()
  })

  onDestroy(() => {
    expansionState[label] = false
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
    console.log(`updating tree at ${tree.path} `)
    setProgressIndicator(true)

    const treeData = await fetchUrl(`azstorage.json?path=${tree.path}`)
    if (treeData) {
      node.children = treeData.tree.children
      //console.log(node.children)
      const childNodes = node.children.filter((item) => item.url !== null)
      //console.log(node.children)
      console.log(`got vector tile at ${treeData.tree} `)
      // store metadata upon expansion of node
      Promise.all(
        childNodes.map((node) => {
          return {
            data: fetchUrl(`${titilerApiUrl}/info?url=${getBase64EncodedUrl(node.url)}`),
            node,
          }
        }),
      ).then((responses) => {
        responses.forEach((response) => {
          response.data.then((layerInfo) => {
            const layerPathHash = hash(response.node.path)

            if (layerInfo?.band_metadata?.length > 0 && !$layerMetadata.has(layerPathHash)) {
              setLayerMetaDataStore(layerPathHash, layerInfo)
            }
          })
        })
      })
    }

    setProgressIndicator(false)
  }

  const getBase64EncodedUrl = (url: string) => {
    const [base, sign] = url.split('?')
    return `${base}?${btoa(sign)}`
  }

  const setLayerMetaDataStore = (layerPathHash: number, layerInfo: LayerInfo) => {
    const layerMetadataClone = cloneDeep($layerMetadata)

    const metadata = {
      description: layerInfo.band_metadata[0][1]['Description'],
      source: layerInfo.band_metadata[0][1]['Source'],
      unit: layerInfo.band_metadata[0][1]['Unit'],
    }

    layerMetadataClone.set(layerPathHash, metadata)
    $layerMetadata = layerMetadataClone

    return metadata
  }

  const paramsToQueryString = (params: Record<string, unknown>) => {
    return Object.keys(params)
      .map((key) => key + '=' + params[key])
      .join('&')
  }

  const setProgressIndicator = (state: boolean) => {
    loadingLayer = state
    $indicatorProgress = state
  }

  const loadLayer = async () => {
    setProgressIndicator(true)

    const tileSourceId = path
    const layerId = uuidv4()
    let layerInfo: LayerInfo = {}

    if (!isRaster) {
      SelectLayerStyleDialogVisible = true
    } else {
      const layerName = path.split('/')[path.split('/').length - 1]
      const b64EncodedUrl = getBase64EncodedUrl(url)
      layerInfo = await fetchUrl(`${titilerApiUrl}/info?url=${b64EncodedUrl}`)

      const layerBandMetadataMin = layerInfo.band_metadata[0][1]['STATISTICS_MINIMUM']
      const layerBandMetadataMax = layerInfo.band_metadata[0][1]['STATISTICS_MAXIMUM']

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

  const handleRemoveBucket = () => {
    dispatch('remove', { node })
  }

  const [popperRef, popperContent] = createPopperActions({
    placement: 'auto',
    strategy: 'fixed',
  })

  const popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -20],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          mainAxis: true,
        },
      },
    ],
  }

  const handleTooltipMouseEnter = () => {
    // delay display of tooltip and create reference for mouse leave event
    tooltipTimer = setTimeout(async () => {
      const layerPathHash = hash(path)
      let metadata: LayerInfoMetadata

      // get existing metadata from store
      if ($layerMetadata.has(layerPathHash)) {
        metadata = $layerMetadata.get(layerPathHash)
      } else {
        // get metadata from endpoint
        const layerInfo = await fetchUrl(`${titilerApiUrl}/info?url=${getBase64EncodedUrl(url)}`)

        if (layerInfo?.band_metadata?.length > 0) {
          metadata = setLayerMetaDataStore(layerPathHash, layerInfo)
        } else {
          metadata = {
            description: 'N/A',
            source: 'N/A',
            unit: 'N/A',
          }
        }
      }

      if (metadata) {
        layerInfoMetadata = {
          description: metadata.description,
          source: metadata.source,
          unit: metadata.unit,
        }
      }

      showTooltip = true
    }, 200)

    // hide popover after 5 seconds
    setTimeout(() => {
      handleToolipMouseLeave
    }, 5000)
  }

  const handleToolipMouseLeave = () => {
    if (tooltipTimer) clearTimeout(tooltipTimer)
    showTooltip = false
  }
</script>

<li style="padding-left:{level * 0.75}rem;">
  <div style="padding-bottom: 5px;">
    {#if children}
      <div class="node-container" transition:slide={{ duration: expanded ? 0 : 350 }}>
        <div class="tree-icon" on:click={() => toggleExpansion()}>
          {#if loadingLayer === true}
            <Fa icon={faSync} size="sm" spin />
          {:else if level === 0}
            <Fa icon={faDatabase} size="sm" style="cursor: pointer;" />
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
          {level === 0 ? label : clean(label)}
        </div>

        {#if url}
          <div class="icon" alt={iconVector.label} title={iconVector.label}>
            <Wrapper>
              <Fa icon={iconVector.icon} size="sm" primaryColor={iconVector.color} />
              <Tooltip showDelay={0} hideDelay={100} yPos="above">Vector</Tooltip>
            </Wrapper>
          </div>
        {/if}

        {#if level === 0}
          <div
            alt="Remove container"
            title="Remove container"
            data-testid="remove-container"
            class="close"
            style="width: 19.5px; height: 19.5px; cursor: pointer;"
            on:click={handleRemoveBucket}>
            <Fa icon={faWindowClose} size="sm" />
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
          <div
            class="name raster"
            use:popperRef
            on:mouseenter={() => handleTooltipMouseEnter()}
            on:mouseleave={() => handleToolipMouseLeave()}>
            {clean(label)}
          </div>
          <div
            class="icon"
            alt="Download Layer Data"
            style="cursor: pointer;"
            title="Download Layer Data"
            on:click={() => downloadFile(url)}>
            <Wrapper>
              <Fa icon={faDownload} size="sm" />
              <Tooltip showDelay={0} hideDelay={100} yPos="above">Download Layer Data</Tooltip>
            </Wrapper>
          </div>
          <div class="icon" alt={iconRaster.label} title={iconRaster.label}>
            <Wrapper>
              <Fa icon={iconRaster.icon} size="sm" primaryColor={iconRaster.color} />
              <Tooltip showDelay={0} hideDelay={100} yPos="above">Raster</Tooltip>
            </Wrapper>
          </div>
        {:else}
          <div class="name">
            {clean(label)}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</li>

{#if showTooltip}
  <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
    <div class="columns is-vcentered is-mobile">
      <div class="column is-full">
        <div class="label">{clean(label)}</div>
        <div class="description">{layerInfoMetadata?.description}</div>
        <div class="source is-size-6">
          <span class="has-text-weight-bold">Source: </span>{layerInfoMetadata?.source}
        </div>
        <div class="unit is-size-6"><span class="has-text-weight-bold">Unit: </span>{layerInfoMetadata?.unit}</div>
      </div>
    </div>
    <div id="arrow" data-popper-arrow />
  </div>
{/if}

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

  $tooltip-background: #fff;

  #tooltip {
    background: $tooltip-background;
    border-radius: 7.5px;
    border: 1px solid #ccc;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    font-size: 13px;
    font-weight: bold;
    max-width: 450px;
    width: 450px;
    min-height: 150px;
    padding: 15px;
    padding-top: 10px;
    position: absolute;
    top: 10px;

    @media (prefers-color-scheme: dark) {
      background: #212125;
    }

    .columns {
      .is-full {
        padding-right: 40px;

        .description,
        .source,
        .unit {
          font-weight: normal;
          color: #000;
          margin-bottom: 10px;

          @media (prefers-color-scheme: dark) {
            color: #fff;
          }
        }

        .label {
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-bottom: 10px;

          @media (prefers-color-scheme: dark) {
            color: #fff;
          }
        }

        .description {
          margin-bottom: 15px;
        }
      }
    }

    #arrow,
    #arrow::before {
      position: absolute;
      width: 18px;
      height: 18px;
      background: $tooltip-background;
      left: -4.5px;

      @media (prefers-color-scheme: dark) {
        background: #212125;
      }
    }

    #arrow {
      visibility: visible;
    }

    #arrow::before {
      visibility: visible;
      content: '';
      transform: rotate(45deg);
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
    }
  }
</style>
