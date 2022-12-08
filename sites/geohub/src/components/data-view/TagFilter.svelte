<script lang="ts">
  import { tagSearchKeys } from '$lib/constants'
  import type { Tag } from '$lib/types/Tag'
  import { onMount } from 'svelte'
  import { TreeView, TreeBranch, TreeLeaf } from 'svelte-tree-view-component'

  let tags: { [key: string]: Tag[] } = {}

  export let selectedTags: Tag[]
  export let operatorType: 'and' | 'or'
  export let currentSearchUrl = ''

  const colorOptions = [
    'is-black',
    'is-primary',
    'is-link',
    'is-info',
    'is-success',
    'is-warning',
    'is-danger',
    'is-primary is-light',
    'is-link is-light',
    'is-info is-light',
    'is-success is-light',
    'is-warning is-light',
    'is-danger is-light',
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
        value.color = getTagColor()
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

  const getTagColor = () => {
    const index = Math.floor(Math.random() * colorOptions.length)
    return colorOptions[index]
  }
</script>

{#if selectedTags.length > 0}
  <p class="subtitle is-6 my-0">Selected tags:</p>
  <div class="container p-0 m-0">
    {#each selectedTags as tag}
      <span class="tag is-small m-1 {tag.color}">
        {tag.value}
        <button
          class="delete is-small"
          on:click={() => handleTagChecked(tag)} />
      </span>
    {/each}
  </div>
{/if}

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
    {/key}
  </TreeView>
  <div
    hidden={tags && Object.keys(tags).length > 0}
    class="loader"
    aria-busy="true"
    aria-live="polite" />
</div>

<div class="tile is-vertical pb-2">
  <div class="tile">
    <label class="radio">
      <input
        class="radio-button"
        type="radio"
        name="operator"
        bind:group={operatorType}
        value="and" />
      Match all selected tags
    </label>
  </div>
  <div class="tile">
    <label class="radio">
      <input
        class="radio-button"
        type="radio"
        name="operator"
        bind:group={operatorType}
        value="or" />
      Match at least a tag selected
    </label>
  </div>
</div>

{#if selectedTags?.length > 0}
  <!-- svelte-ignore a11y-missing-attribute -->
  <a
    class="button button-primary button-without-arrow clear-tag-button"
    role="button"
    on:click={clearAllTags}>
    Clear all tags
  </a>
{/if}

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/checkbox.min.css';
  @use '../../styles/undp-design/buttons.min.css';
  @use '../../styles/undp-design/radio.min.css';
  @use '../../styles/undp-design/loader.min.css';

  .subtitle {
    border-bottom: 1px solid gray;
    font-weight: bold;
  }

  .box {
    position: relative;
    min-height: 200px;
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid gray;

    .loader {
      position: absolute;
      z-index: 10;
      top: 40px;
      left: 50px;
      background-color: white;
      transform: translate(-25%, -35%);
      -webkit-transform: translate(-25%, -35%);
      -ms-transform: translate(-25%, -35%);
    }
  }

  .radio-button {
    position: relative;
    top: 0.2rem;
  }

  .clear-tag-button {
    width: 100%;
  }
</style>
