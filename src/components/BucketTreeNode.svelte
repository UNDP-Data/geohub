<script context="module" lang="ts">
  const expansionState = {}
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import type { TreeNode } from '$lib/types'
  import BucketTreeBranch from './BucketTreeBranch.svelte'
  import BucketTreeItem from './BucketTreeItem.svelte'

  export let level = 0
  export let node: TreeNode

  const dispatch = createEventDispatcher()

  let isLoading = false

  $: tree = node
  $: ({ label, children } = tree)
  $: expanded = expansionState[label] || false

  onMount(() => {
    if (level === 0) toggleExpansion()
  })

  onDestroy(() => {
    expansionState[label] = false
  })

  const toggleExpansion = () => {
    expanded = expansionState[label] = !expanded

    setTimeout(() => {
      if (isLoading === true) {
        isLoading = false
      }
    }, 2000)
  }

  const handleRemoveBucket = () => {
    dispatch('remove', { node })
  }
</script>

<li style="padding-left:{level * 0.75}rem;">
  {#if children}
    <BucketTreeBranch bind:tree={node} bind:isLoading bind:level bind:expanded {handleRemoveBucket} {toggleExpansion} />
  {:else}
    <BucketTreeItem bind:tree={node} bind:isLoading bind:expanded />
  {/if}
</li>

{#if children && expanded}
  {#each children as child, ti}
    <svelte:self node={child} level={level + 1} />
  {/each}
{/if}
