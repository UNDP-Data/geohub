<script context="module">
  // retain module scoped expansion state for each tree node
  const _expansionState = {
    /* treeNodeId: expanded <boolean> */
  }
</script>

<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import FaLayers from 'svelte-fa/src/fa-layers.svelte'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
  import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup'
  import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'

  import BucketTreeNodeCardButton from '$components/BucketTreeNodeCardButton.svelte'
  import { LayerIconTypes, LayerTypes } from '$lib/constants'
  import { clean, fetchUrl, downloadFile } from '$lib/helper'

  import type { TreeNode } from '$lib/types'
  import { indicatorProgress } from '$stores'

  export let level = 0
  export let tree: TreeNode

  const iconRaster = LayerIconTypes.find((icon) => icon.id === LayerTypes.RASTER)

  let iconVector = LayerIconTypes.find((icon) => icon.id === LayerTypes.VECTOR)

  let loadingLayer = false

  let stacPaginationAction = ''
  let stacPaginationLabel = ''

  let expanded = _expansionState[tree.label] || false
  const toggleExpansion = () => {
    expanded = _expansionState[tree.label] = !expanded
    if (tree?.children.length === 0) updateTreeStore()
  }

  const updateTreeStore = async () => {
    setProgressIndicator(true)
    let treeData

    if (tree.isStac) {
      const catalogId = tree.path.split('/')[0]
      treeData = await fetchUrl(
        `stac.json?id=${catalogId}&path=${tree.path}&token=${stacPaginationAction}&item=${stacPaginationLabel
          .split('/')
          .pop()
          .replace(/\.[^/.]+$/, '')}`,
      )
    } else if (tree.isMartin) {
      treeData = await fetchUrl(
        `martin.json?path=${tree.path}&label=${tree.label}${tree.url === null ? '&isschema=true' : ''}`,
      )
    } else {
      treeData = await fetchUrl(`azstorage.json?path=${tree.path}`)
    }
    if (treeData) {
      tree = treeData.tree
    }
    console.log(tree)
    setProgressIndicator(false)
  }

  const setProgressIndicator = (state: boolean) => {
    loadingLayer = state
    $indicatorProgress = state
  }

  const loadLayer = async () => {
    setProgressIndicator(true)

    setProgressIndicator(false)
  }

  const handleEnterKeyForDownload = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      downloadFile(tree.url)
    }
  }
</script>

<ul>
  <!-- transition:slide -->
  <li>
    {#if tree.children}
      <span on:click={toggleExpansion} style="color:gray; margin-left:5px" class="tree-icon">
        {#if loadingLayer === true}
          <Fa icon={faSync} size="sm" spin />
        {:else if level === 0}
          <Fa icon={faDatabase} size="sm" style="cursor: pointer;" />
        {:else if !expanded}
          <Fa icon={faChevronRight} size="sm" style="cursor: pointer;" />
        {:else}
          <Fa icon={faChevronRight} size="sm" style="cursor: pointer; transform: rotate(90deg);" />
        {/if}
        {clean(tree.label)}
      </span>
      {#if expanded}
        {#each tree.children as child}
          <svelte:self tree={child} level={level + 1} />
        {/each}
      {/if}
    {:else}
      <span>
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

        {clean(tree.label)}

        <BucketTreeNodeCardButton bind:node={tree} />

        {#if tree.isRaster}
          <div
            class="icon"
            alt="Download Layer Data"
            style="cursor: pointer;"
            title="Download Layer Data"
            on:click={() => downloadFile(tree.url)}
            on:keydown={handleEnterKeyForDownload}>
            <Wrapper>
              <Fa icon={faDownload} size="sm" />
              <Tooltip showDelay={0} hideDelay={100} yPos="above">Download Layer Data</Tooltip>
            </Wrapper>

            <div class="icon" alt={iconRaster.label} title={iconRaster.label}>
              <Wrapper>
                <Fa rotate={140} icon={iconRaster.icon} size="sm" primaryColor={iconRaster.color} />
                <Tooltip showDelay={0} hideDelay={100} yPos="above">Raster</Tooltip>
              </Wrapper>
            </div>
          </div>
        {:else}
          <div class="icon" alt={iconVector.label} title={iconVector.label}>
            <Wrapper>
              <Fa icon={iconVector.icon} size="sm" primaryColor={iconVector.color} />
              <Tooltip showDelay={500} hideDelay={100} yPos="above">Vector</Tooltip>
            </Wrapper>
          </div>
        {/if}
      </span>
    {/if}
  </li>
</ul>

<style lang="scss">
  ul {
    margin: 0;
    list-style: none;
    padding-left: 1.2rem;
    user-select: none;
  }
  .no-arrow {
    padding-left: 1rem;
  }
</style>
