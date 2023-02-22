<script lang="ts">
  import { tagSearchKeys } from '$lib/constants'
  import type { Tag } from '$lib/types/Tag'
  import { onMount } from 'svelte'
  import { TreeView, TreeBranch, TreeLeaf } from 'svelte-tree-view-component'
  import { Button, Checkbox, Radios, Loader, type Radio } from '@undp-data/svelte-undp-design'
  import SelectedTags from './SelectedTags.svelte'
  import { getBulmaTagColor } from '$lib/helper'

  let tags: { [key: string]: Tag[] } = {}

  export let selectedTags: Tag[]
  export let operatorType: 'and' | 'or'
  export let currentSearchUrl = ''

  let operatorTypes: Radio[] = [
    {
      label: 'Match all selected tags',
      value: 'and',
    },
    {
      label: 'Match at least a tag selected',
      value: 'or',
    },
  ]

  onMount(async () => {
    if (!(tags && Object.keys(tags).length > 0)) {
      await getTags()
    }
  })

  $: currentSearchUrl, getTags()

  const getTags = async () => {
    const res = await fetch(`/api/tags${currentSearchUrl ? `?url=${encodeURIComponent(currentSearchUrl)}` : ''}`)
    const json: { [key: string]: Tag[] } = await res.json()

    tagSearchKeys.forEach((t) => {
      if (!json[t.key]) return
      tags[t.key] = json[t.key]
    })
  }

  const handleTagChecked = (value: Tag) => {
    const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value)
    if (tag) {
      selectedTags.splice(selectedTags.indexOf(tag), 1)
      selectedTags = [...selectedTags]
    } else {
      if (!value.color) {
        value.color = getBulmaTagColor()
      }
      selectedTags = [...selectedTags, value]
    }
  }

  const existTag = (value: Tag) => {
    const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value)
    if (tag) {
      return true
    } else {
      return false
    }
  }

  const checkChildrenTicked = (key: string) => {
    const tags = selectedTags?.filter((t) => t.key === key)
    return !(tags && tags.length > 0)
  }

  const clearAllTags = () => {
    selectedTags = []
  }

  const getTagSearchKey = (key: string) => {
    return tagSearchKeys?.find((t) => t.key === key)
  }
</script>

<SelectedTags
  bind:selectedTags
  isClearButtonShown={true} />

<div class="box p-0 m-0 px-4 my-2">
  <TreeView
    lineColor="#ff0000"
    iconBackgroundColor="#ff0000"
    iconColor="#FFFFFF"
    branchHoverColor="#ff0000">
    {#key selectedTags}
      {#if tagSearchKeys}
        {#each Object.keys(tags) as key}
          <TreeBranch
            rootContent={getTagSearchKey(key).label}
            defaultClosed={checkChildrenTicked(key)}>
            {#if tags[key]}
              {#each tags[key] as tag}
                <TreeLeaf>
                  <Checkbox
                    label="{tag.value} ({tag.count})"
                    checked={existTag(tag)}
                    on:clicked={() => {
                      handleTagChecked(tag)
                    }} />
                </TreeLeaf>
              {/each}
            {/if}
          </TreeBranch>
        {/each}
      {/if}
    {/key}
  </TreeView>
  <div
    hidden={tags && Object.keys(tags).length > 0}
    class="loader-container">
    <Loader size="small" />
  </div>
</div>

<div class="container pb-2">
  <Radios
    bind:radios={operatorTypes}
    bind:value={operatorType}
    groupName="operator"
    isVertical={true} />
</div>

{#if selectedTags?.length > 0}
  <Button
    title="Clear all tags"
    on:clicked={clearAllTags} />
{/if}

<style lang="scss">
  .subtitle {
    border-bottom: 1px solid gray;
    font-weight: bold;
  }

  .box {
    position: relative;
    height: 150px;
    overflow-y: auto;
    border: 1px solid gray;

    .loader-container {
      position: absolute;
      z-index: 10;
      top: 40%;
      left: 45%;
      background-color: white;
    }
  }

  .clear-tag-button {
    width: 100%;
  }
</style>
