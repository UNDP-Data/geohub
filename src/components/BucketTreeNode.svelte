<script context="module" lang="ts">
  const expansionState = {}
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { v4 as uuidv4 } from 'uuid'
  import Fa from 'svelte-fa'
  import FaLayers from 'svelte-fa/src/fa-layers.svelte'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
  import { faWindowClose } from '@fortawesome/free-solid-svg-icons/faWindowClose'
  import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup'
  import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'

  import type { RasterLayerSpecification, RasterSourceSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { createPopperActions } from 'svelte-popperjs'
  import { cloneDeep } from 'lodash-es'

  import AddLayerModal from '$components/controls/AddLayerModal.svelte'
  import {
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    ErrorMessages,
    LayerIconTypes,
    LayerTypes,
    StatusTypes,
    DEFAULT_COLORMAP,
  } from '$lib/constants'
  import { fetchUrl, hash, clean, downloadFile } from '$lib/helper'
  import type { BannerMessage, TreeNode, RasterTileMetadata, LayerInfoMetadata } from '$lib/types'
  import { map, layerList, layerMetadata, indicatorProgress, bannerMessages, modalVisible } from '$stores'

  export let level = 0
  export let node: TreeNode

  const dispatch = createEventDispatcher()
  const iconRaster = LayerIconTypes.find((icon) => icon.id === LayerTypes.RASTER)

  const titilerApiUrl = import.meta.env.VITE_TITILER_ENDPOINT
  let iconVector = LayerIconTypes.find((icon) => icon.id === LayerTypes.VECTOR)
  let layerInfoMetadata: LayerInfoMetadata
  let loadingLayer = false
  let isAddLayerModalVisible: boolean
  let showTooltip = false
  let tooltipTimer: ReturnType<typeof setTimeout>

  $: tree = node
  $: ({ label, children, path, url, isRaster, geomType } = tree)
  $: expanded = expansionState[label] || false
  $: mmap = $map

  onMount(() => {
    if (level === 0) toggleExpansion()
    if (geomType !== undefined) {
      iconVector = getVectorLayerIcon(geomType)
    }
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
    setProgressIndicator(true)

    const treeData = await fetchUrl(`azstorage.json?path=${tree.path}`)
    if (treeData) {
      //set  node value to the result of the fetch. This will actualy work becauase the tree is recursive
      // TODO: evaluate if the  node should be assigned at ethe end of this function. This would allow to remove
      // potentially invalid layers from the tree!!!!
      node = treeData.tree
      // the info endpoint returns metadata for rasters. the same needs to be implemented for
      // vector data with the difference that the metadata will be coming from .metadata.json

      //const rasterChildNodes = node.children.filter((item) => item.url !== null && item.isRaster)
      //const vectorChildNodes = node.children.filter((item) => item.url !== null && !item.isRaster)
      const childNodes = node.children.filter((item) => item.url !== null)

      Promise.all(
        childNodes.map((node) => {
          const layerURL = new URL(node.url)
          const infoURI: string = node.isRaster
            ? `${titilerApiUrl}/info?url=${getBase64EncodedUrl(node.url)}`
            : `${layerURL.origin}${decodeURIComponent(layerURL.pathname).replace('{z}/{x}/{y}.pbf', 'metadata.json')}${
                layerURL.search
              }`
          return {
            data: fetchUrl(infoURI),
            node,
          }
        }),
      ).then((responses) => {
        responses.forEach((response) => {
          response.data.then((layerInfo) => {
            const layerPathHash = hash(response.node.path)
            if (response.node.isRaster) {
              if (layerInfo?.band_metadata?.length > 0 && !$layerMetadata.has(layerPathHash)) {
                const metadata: LayerInfoMetadata = <LayerInfoMetadata>{
                  description: layerInfo.band_metadata[0][1]['Description'],
                  source: layerInfo.band_metadata[0][1]['Source'],
                  unit: layerInfo.band_metadata[0][1]['Unit'],
                }

                setLayerMetaDataStore(layerPathHash, metadata)
              }
            } else {
              const metadata: LayerInfoMetadata = <LayerInfoMetadata>{
                description: layerInfo.description,
                source: layerInfo.source,
                unit: undefined,
              }
              setLayerMetaDataStore(layerPathHash, metadata)
            }
          })
        })
      })
    }

    setProgressIndicator(false)
  }

  const getVectorLayerIcon = (layerGeomType: string) => {
    return LayerIconTypes.find((icon) => layerGeomType.toLowerCase().includes(icon.id))
  }

  const getBase64EncodedUrl = (url: string) => {
    const [base, sign] = url.split('?')
    return `${base}?${btoa(sign)}`
  }

  const setLayerMetaDataStore = (layerPathHash: number, metadata: LayerInfoMetadata) => {
    const layerMetadataClone = cloneDeep($layerMetadata)
    layerMetadataClone.set(layerPathHash, metadata)
    $layerMetadata = layerMetadataClone
    return
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

    if (!isRaster) {
      const layerURL = new URL(url)
      const metaURI = `${layerURL.origin}${decodeURIComponent(layerURL.pathname).replace(
        '{z}/{x}/{y}.pbf',
        'metadata.json',
      )}${layerURL.search}`

      const layerMeta = await fetchUrl(metaURI)
      if (layerMeta.json) {
        layerMeta.json = JSON.parse(layerMeta.json)
      }
      node.metadata = layerMeta
      isAddLayerModalVisible = true
      $modalVisible = true
      $indicatorProgress = false

      setTimeout(function () {
        loadingLayer = false
      }, 350)
    } else {
      let layerInfo: RasterTileMetadata = {}
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

        const layerSource: RasterSourceSpecification = {
          type: LayerTypes.RASTER,
          tiles: [`${titilerApiUrl}/tiles/{z}/{x}/{y}.png?${paramsToQueryString(titilerApiUrlParams)}`],
          tileSize: 256,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
            colorMapName: DEFAULT_COLORMAP,
            continuous: {
              minimum: parseFloat(layerBandMetadataMin),
              maximum: parseFloat(layerBandMetadataMax),
            },
            intervals: {
              classification: ClassificationMethodTypes.EQUIDISTANT,
              numberOfClasses: COLOR_CLASS_COUNT,
              colorMapRows: [],
            },
            unique: {
              colorMapRows: [],
            },
            expression: '',
            legendType: '',
            source: layerSource,
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
        const layerURL = new URL(url)
        const infoURI: string = isRaster
          ? `${titilerApiUrl}/info?url=${getBase64EncodedUrl(node.url)}`
          : `${layerURL.origin}${decodeURIComponent(layerURL.pathname).replace('{z}/{x}/{y}.pbf', 'metadata.json')}${
              layerURL.search
            }`
        const layerInfo = await fetchUrl(infoURI)

        if (isRaster) {
          if (layerInfo?.band_metadata?.length > 0 && !$layerMetadata.has(layerPathHash)) {
            metadata = <LayerInfoMetadata>{
              description: layerInfo.band_metadata[0][1]['Description'],
              source: layerInfo.band_metadata[0][1]['Source'],
              unit: layerInfo.band_metadata[0][1]['Unit'],
            }

            setLayerMetaDataStore(layerPathHash, metadata)
          }
        } else {
          //layerInfo here is the whole metadata.json so the propes needs to be extracted into a new object
          metadata = <LayerInfoMetadata>{
            description: layerInfo.description,
            source: layerInfo.attribution,
          }

          setLayerMetaDataStore(layerPathHash, metadata)
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
        {#if url}
          <div alt="Vector" class="load-layer" on:click={loadLayer}>
            {#if loadingLayer === true}
              <Fa icon={faSync} size="sm" spin />
            {:else}
              <Wrapper>
                <!-- <Fa icon={faCirclePlus} size="sm" style="cursor: pointer;" /> -->
                <FaLayers size="sm" style="cursor: pointer;">
                  <Fa icon={faLayerGroup} scale={1} />
                  <Fa icon={faPlus} scale={0.8} translateY={0.4} translateX={0.5} style="color:white" />
                </FaLayers>
                <Tooltip showDelay={500} hideDelay={100} yPos="above">Add Layer</Tooltip>
              </Wrapper>
            {/if}
          </div>
          <div
            class="name vector"
            use:popperRef
            on:mouseenter={() => handleTooltipMouseEnter()}
            on:mouseleave={() => handleToolipMouseLeave()}>
            {clean(label)}
          </div>
        {:else}
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
          <div class="name">
            {clean(label)}
          </div>
        {/if}

        {#if url}
          <div class="icon" alt={iconVector.label} title={iconVector.label}>
            <Wrapper>
              <Fa icon={iconVector.icon} size="sm" primaryColor={iconVector.color} />
              <Tooltip showDelay={500} hideDelay={100} yPos="above">Vector</Tooltip>
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
                <!-- <Fa icon={faCirclePlus} size="sm" style="cursor: pointer;" /> -->
                <FaLayers size="sm" style="cursor: pointer;">
                  <Fa icon={faLayerGroup} scale={1} />
                  <Fa icon={faPlus} scale={0.8} translateY={0.4} translateX={0.5} style="color:white" />
                </FaLayers>
                <Tooltip showDelay={500} hideDelay={100} yPos="above">Add Layer</Tooltip>
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
              <Fa rotate={140} icon={iconRaster.icon} size="sm" primaryColor={iconRaster.color} />
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
          <span class="has-text-weight-bold">Source: </span>{layerInfoMetadata?.source
            ? layerInfoMetadata.source
            : 'N/A'}
        </div>
        {#if layerInfoMetadata?.unit}
          <div class="unit is-size-6">
            <span class="has-text-weight-bold">Unit: </span>{layerInfoMetadata?.unit ? layerInfoMetadata.unit : 'N/A'}
          </div>
        {/if}
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

<AddLayerModal bind:isModalVisible={isAddLayerModalVisible} treeNode={tree} />

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
        color: rgb(138, 20, 20);
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
