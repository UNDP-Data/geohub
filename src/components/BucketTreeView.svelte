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

  $: tree = node
  $: ({ label, children } = tree)
  $: IsExpanded = expansionState[label] || false

  onMount(() => {
    if (level === 0) toggleExpansion()
  })

  onDestroy(() => {
    expansionState[label] = false
  })

  const toggleExpansion = () => {
    IsExpanded = expansionState[label] = !IsExpanded
  }

  const handleRemoveBucket = () => {
    dispatch('remove', { node })
  }
</script>

<li style="padding-left:{level * 0.75}rem;">
  {#if children}
    <BucketTreeBranch bind:tree={node} bind:level bind:IsExpanded {handleRemoveBucket} {toggleExpansion} />
  {:else}
    <BucketTreeItem bind:tree={node} bind:IsExpanded />
  {/if}
</li>

{#if children && IsExpanded}
  {#each children as child}
    <svelte:self node={child} level={level + 1} />
  {/each}
{/if}
