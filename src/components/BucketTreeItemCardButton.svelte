<script lang="ts">
  import { fade } from 'svelte/transition'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { clickOutside } from 'svelte-use-click-outside'
  import type { LayerInfoMetadata, TreeNode } from '$lib/types'
  import { clean, fetchUrl, getActiveBandIndex, getBase64EncodedUrl, hash } from '$lib/helper'
  import Popper from '$lib/popper'
  import { layerMetadata, bucketList } from '$stores'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import { onMount } from 'svelte'

  export let tree: TreeNode
  let layerInfoMetadata: LayerInfoMetadata = undefined
  let showTooltip = false

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-start',
      strategy: 'fixed',
    },
    [0, 5],
  ).init()

  onMount(() => {
    // Generate the metadata and store it in the store
    generateTreeNodeMetadata()
  })

  export const generateTreeNodeMetadata = async () => {
    const layerPathHash = hash(tree.path)
    let metadata: LayerInfoMetadata

    // get existing metadata from store
    if ($layerMetadata.has(layerPathHash)) {
      metadata = $layerMetadata.get(layerPathHash)
    } else {
      if (tree.isStac) {
        if (tree.isMosaicJSON) {
          await setLayerMetaDataStore(tree.description, clean(tree.id.split('_')[1]), 'N/A', layerPathHash)
        } else {
          let description = ''

          const bucketStac = $bucketList.find((bucket) => bucket.id === tree.path.split('/')[0])
          const itemsUrl = []
          itemsUrl.push(bucketStac.url)
          itemsUrl.push(tree.path.split('/')[1])
          itemsUrl.push('items')
          itemsUrl.push(tree.label)
          let layerInfo = await fetchUrl(itemsUrl.join('/'))

          if (layerInfo?.properties?.description === undefined) {
            layerInfo = await fetchUrl(itemsUrl.slice(0, -2).join('/'))
            description = layerInfo?.description === undefined ? 'N/A' : layerInfo.description
          } else {
            description = layerInfo.properties.description
          }

          const source = layerInfo?.properties?.platform === undefined ? 'N/A' : layerInfo.properties.platform
          await setLayerMetaDataStore(description, source, 'N/A', layerPathHash)
        }
      } else {
        // get metadata from endpoint
        const layerURL = new URL(tree.url)
        const infoURI: string = tree.isRaster
          ? `${PUBLIC_TITILER_ENDPOINT}/info?url=${getBase64EncodedUrl(tree.url)}`
          : `${layerURL.origin}${decodeURIComponent(layerURL.pathname).replace('{z}/{x}/{y}.pbf', 'metadata.json')}${
              layerURL.search
            }`
        const layerInfo = await fetchUrl(infoURI)

        if (tree.isRaster) {
          if (layerInfo?.band_metadata?.length > 0 && !$layerMetadata.has(layerPathHash)) {
            const bandIndex = getActiveBandIndex(layerInfo)
            await setLayerMetaDataStore(
              layerInfo.band_metadata[bandIndex][1]['Description'],
              layerInfo.band_metadata[bandIndex][1]['Source'],
              layerInfo.band_metadata[bandIndex][1]['Unit'],
              layerPathHash,
            )
          }
        } else {
          await setLayerMetaDataStore(layerInfo.description, layerInfo.source, 'N/A', layerPathHash)
        }
      }

      metadata = $layerMetadata.get(layerPathHash)
    }

    if (metadata) {
      layerInfoMetadata = {
        description: metadata.description,
        source: metadata.source,
        unit: metadata.unit,
      }
    }
  }

  const setLayerMetaDataStore = async (description: string, source: string, unit: string, layerPathHash: number) => {
    const metadata = <LayerInfoMetadata>{
      description,
      source,
      unit,
    }
    $layerMetadata.set(layerPathHash, metadata)
  }

  const handleClose = () => {
    showTooltip = false
  }

  $: {
    if (showTooltip === true) {
      generateTreeNodeMetadata()
    } else {
      setTimeout(handleClose, 100)
    }
  }

  const handleEnterKeyForInfo = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      showTooltip = !showTooltip
    }
  }
</script>

<div
  class="icon"
  alt="Show more detailed information"
  title="Show more detailed information"
  use:popperRef
  on:click={() => (showTooltip = !showTooltip)}
  on:keydown={handleEnterKeyForInfo}>
  <Wrapper>
    {#if showTooltip}
      <i class="fa-solid fa-xmark sm" />
    {:else}
      <i class="fa-solid fa-circle-info sm" />
    {/if}
    <Tooltip
      showDelay={0}
      hideDelay={100}
      yPos="above">{`${showTooltip ? 'Hide' : 'Show'} infomation`}</Tooltip>
  </Wrapper>
</div>

{#if showTooltip}
  <div
    id="tooltip"
    data-testid="tooltip"
    use:popperContent={popperOptions}
    transition:fade
    use:clickOutside={handleClose}>
    <div
      class="close"
      alt="Close"
      title="Close"
      on:click={handleClose}>
      <i class="fa-solid fa-xmark sm" />
    </div>

    <div class="bucket-card">
      <div class="columns is-vcentered is-mobile">
        <div class="column is-full">
          <div class="label">{clean(tree.label)}</div>
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

          <div class="content is-size-7 tags pt-3">
            {#if tree.tags}
              {#each Object.values(tree.tags) as tag}
                <span
                  title="tag"
                  style="margin-right: 5px; font-weight: bold;">
                  <span class="tag is-info is-small is-light">{clean(tag)}</span>
                </span>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>
    <div
      id="arrow"
      data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  @import '../styles/popper.scss';
  @import '../styles/button-icons-selected.scss';

  .icon {
    cursor: pointer;
  }

  .bucket-card {
    text-align: justify;
    text-justify: inter-word;
    word-wrap: break-word;

    .columns {
      z-index: 10;
      position: relative;

      .is-full {
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
  }

  #tooltip {
    max-width: 450px;

    .close {
      text-align: right;
      z-index: 10;
      cursor: pointer;
    }
  }
</style>
