<script context="module" lang="ts">
  const expansionState = {}
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import FaLayers from 'svelte-fa/src/fa-layers.svelte'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
  import { faWindowClose } from '@fortawesome/free-solid-svg-icons/faWindowClose'
  import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup'
  import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'

  import { LayerIconTypes, LayerTypes } from '$lib/constants'
  import { clean, fetchUrl } from '$lib/helper'

  import type { TreeNode } from '$lib/types'
  import { bucketList, indicatorProgress } from '$stores'
  import type { StacCollection } from '$lib/interfaces'

  export let level = 0
  export let node: TreeNode
  export let hideCloseButton = false

  const dispatch = createEventDispatcher()
  const iconRaster = LayerIconTypes.find((icon) => icon.id === LayerTypes.RASTER)

  let loadingLayer = false

  $: tree = node
  $: ({ label, children, path, url, isRaster, geomType, id } = tree)
  $: expanded = expansionState[label] || false
  const bid = level == 0 ? node.id : null

  onMount(() => {
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
    if (tree.isMosaic !== true) return
    setProgressIndicator(true)

    console.log(tree)
    const stacCollection: StacCollection[] = await fetchUrl(`stac/collection?url=${encodeURI(tree.url)}`)
    let treeData: TreeNode[] = stacCollection.map((collection) => {
      return {
        id: collection.id,
        label: collection.title,
        path: `${node.path}${collection.id}`,
        url: collection.links.find((link) => link.rel === 'items').href,
        isRaster: false,
        isStac: false,
        isMosaic: true,
        isParent: true,
        children: [],
      }
    })
    if (treeData) {
      node = {
        id: node.id,
        label: node.label,
        path: node.path,
        url: node.url,
        isRaster: false,
        isStac: false,
        isMosaic: true,
        isParent: true,
        children: treeData,
      }
    }
    console.log(node)

    setProgressIndicator(false)
  }

  const setProgressIndicator = (state: boolean) => {
    loadingLayer = state
    $indicatorProgress = state
  }

  const handleRemoveBucket = () => {
    dispatch('remove', { node })
  }

  const handleKD = (event: KeyboardEvent) => {
    if (event.key == 'Enter') {
      const bucketDiv = document.getElementById(bid)
      //console.log(bucketDiv)
      bucketDiv.setAttribute('tabindex', '0')
      bucketDiv.focus()
      bucketDiv.blur()

      handleRemoveBucket()
    }
  }

  const loadLayer = async () => {
    setProgressIndicator(true)

    setProgressIndicator(false)
  }
</script>

<li style="padding-left:{level * 0.75}rem;">
  <div style="padding-bottom: 5px;">
    {#if children}
      <div class="node-container" transition:slide={{ duration: expanded ? 0 : 350 }}>
        {#if !node.isParent}
          <a style="color: gray;cursor: pointer;" href="#" role="button" on:click={loadLayer}>
            {#if loadingLayer === true}
              <Fa icon={faSync} size="sm" spin />
            {:else}
              <Wrapper>
                <FaLayers size="sm" style="cursor: pointer;">
                  <Fa icon={faLayerGroup} scale={1} />
                  <Fa icon={faPlus} scale={0.8} translateY={0.4} translateX={0.5} style="color:black" />
                </FaLayers>
                <Tooltip showDelay={500} hideDelay={100} yPos="above">Add Layer</Tooltip>
              </Wrapper>
            {/if}
          </a>

          <div class="name vector">
            {clean(label)}
          </div>
        {:else}
          <a
            style="color:gray; margin-left:5px"
            class="tree-icon"
            href="#"
            role="button"
            on:click={() => toggleExpansion()}>
            {#if loadingLayer === true}
              <Fa icon={faSync} size="sm" spin />
            {:else if level === 0}
              <Fa icon={faDatabase} size="sm" style="cursor: pointer;" />
            {:else if !expanded}
              <Fa icon={faChevronRight} size="sm" style="cursor: pointer;" />
            {:else}
              <Fa icon={faChevronRight} size="sm" style="cursor: pointer; transform: rotate(90deg);" />
            {/if}
          </a>

          <div class="name">
            <div class="columns">
              <div class="column">{clean(label)}</div>
            </div>
          </div>
        {/if}

        {#if level === 0 && hideCloseButton === false}
          <a
            style="color: gray;width: 19.5px; height: 19.5px; cursor: pointer;"
            href="#"
            role="button"
            on:click={handleRemoveBucket}
            on:keydown={handleKD}>
            <Fa icon={faWindowClose} size="sm" />
          </a>
        {/if}
      </div>
    {:else}
      <div class="node-container">
        <a style="color: gray;cursor: pointer;" href="#" role="button" on:click={loadLayer}>
          {#if loadingLayer === true}
            <Fa icon={faSync} size="sm" spin />
          {:else}
            <Wrapper>
              <FaLayers size="sm" style="cursor: pointer;">
                <Fa icon={faLayerGroup} scale={1} />
                <Fa icon={faPlus} scale={0.8} translateY={0.4} translateX={0.5} style="color:black" />
              </FaLayers>
              <Tooltip showDelay={500} hideDelay={100} yPos="above">Add Layer</Tooltip>
            </Wrapper>
          {/if}
        </a>
        <div class="name raster">
          {clean(label)}
        </div>
        <div class="icon" alt={iconRaster.label} title={iconRaster.label}>
          <Wrapper>
            <Fa rotate={140} icon={iconRaster.icon} size="sm" primaryColor={iconRaster.color} />
            <Tooltip showDelay={0} hideDelay={100} yPos="above">Raster</Tooltip>
          </Wrapper>
        </div>
      </div>
    {/if}
  </div>
</li>

<style lang="scss">
  .node-container {
    align-items: center;
    display: flex;
    height: auto;
    justify-content: left;

    .load-layer {
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }

    .name {
      overflow: hidden;
      padding-left: 5px;
      text-overflow: ellipsis;
      width: 100%;

      @media (prefers-color-scheme: dark) {
        color: white;
      }

      .columns .column {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
</style>
