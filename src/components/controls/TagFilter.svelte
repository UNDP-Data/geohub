<script lang="ts">
  import { tagSearchKeys } from '$lib/constants'
  import type { Tag } from '$lib/types/Tag'
  import { onMount } from 'svelte'
  import { TreeView, TreeBranch, TreeLeaf } from 'svelte-tree-view-component'

  export let tags: { [key: string]: Tag[] } = {}

  export let selectedTags: Tag[]

  onMount(async () => {
    if (!(tags && Object.keys(tags).length > 0)) {
      await getTags()
    }
  })

  const getTags = async () => {
    const res = await fetch('/tags')
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
</script>

<div class="box px-2 py-0">
  <TreeView
    lineColor="#ff0000"
    iconBackgroundColor="#ff0000"
    iconColor="#FFFFFF"
    branchHoverColor="#ff0000">
    {#if tagSearchKeys}
      {#each tagSearchKeys as key}
        <TreeBranch
          rootContent={key.label}
          defaultClosed={checkChildrenTicked(key.key)}>
          {#if tags[key.key]}
            {#each tags[key.key] as tag}
              <TreeLeaf>
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="{tag.key}-{tag.value}"
                    name="{tag.key}-{tag.value}"
                    on:click={() => {
                      handleTagChecked(tag)
                    }}
                    checked={existTag(tag)} />
                  <label for="{tag.key}-{tag.value}">{tag.value} ({tag.count})</label>
                </div>
              </TreeLeaf>
            {/each}
          {/if}
        </TreeBranch>
      {/each}
    {/if}
  </TreeView>
</div>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/checkbox.min.css';

  .box {
    max-height: 250px;
    overflow-y: auto;
  }
</style>
