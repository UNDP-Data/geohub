<script lang="ts">
  import { page } from '$app/stores'
  import { createEventDispatcher } from 'svelte'
  import { tagSearchKeys } from '$lib/constants'
  import type { Tag } from '$lib/types/Tag'
  import { onMount } from 'svelte'
  import { TreeView, TreeBranch, TreeLeaf } from 'svelte-tree-view-component'
  import { Button, Checkbox, Radios, Loader, type Radio } from '@undp-data/svelte-undp-design'
  import SelectedTags from './SelectedTags.svelte'
  import { getBulmaTagColor, getSelectedTagsFromUrl } from '$lib/helper'

  const dispatch = createEventDispatcher()

  let tags: { [key: string]: Tag[] } = {}

  let selectedTags: Tag[] = getSelectedTagsFromUrl($page.url)
  let operatorType: 'and' | 'or' = ($page.url.searchParams.get('operator') as 'and' | 'or') ?? 'and'
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

  onMount(() => {
    init()
  })

  export const init = async (url?: URL) => {
    const _url = url ?? $page.url
    await getTags(_url)
    selectedTags = [...getSelectedTagsFromUrl(_url)]
  }

  const getTags = async (newUrl?: URL) => {
    const currentUrl = newUrl ?? $page.url
    const apiUrl = `/api/tags${
      currentUrl.search ? `?url=${encodeURIComponent(`${currentUrl.origin}/api/datasets${currentUrl.search}`)}` : ''
    }`
    if (newUrl) {
      tags = {}
    }
    const res = await fetch(apiUrl)
    if (!(res.ok && res.status === 200)) return
    const json: { [key: string]: Tag[] } = await res.json()

    tagSearchKeys.forEach((t) => {
      if (!json[t.key]) return
      tags[t.key] = json[t.key]
    })
  }

  $: operatorType, handleOperatorChanged()

  const fireChangeEvent = async (url: URL) => {
    dispatch('change', {
      url: url.toString(),
    })
  }

  const handleOperatorChanged = () => {
    if (!$page) return
    const apiUrl = $page.url
    apiUrl.searchParams.delete('operator')
    apiUrl.searchParams.set('operator', operatorType)
    fireChangeEvent(apiUrl)
  }

  const handleTagChecked = async (value: Tag) => {
    const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value)

    let apiUrl = $page.url
    if (tag) {
      selectedTags.splice(selectedTags.indexOf(tag), 1)
      selectedTags = [...selectedTags]

      const values = apiUrl.searchParams.getAll(value.key)
      apiUrl.searchParams.delete(value.key)
      values
        .filter((v) => v !== value.value)
        ?.forEach((v) => {
          apiUrl.searchParams.append(value.key, v)
        })
    } else {
      if (!value.color) {
        value.color = getBulmaTagColor()
      }
      if (selectedTags) {
        selectedTags = [...selectedTags, value]
      } else {
        selectedTags = [value]
      }
      apiUrl.searchParams.append(value.key, value.value)
    }
    fireChangeEvent(apiUrl)
    getTags(apiUrl)
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
    const apiUrl = $page.url
    tagSearchKeys.forEach((key) => {
      apiUrl.searchParams.delete(key.key)
    })
    fireChangeEvent(apiUrl)
    getTags(apiUrl)
  }

  const getTagSearchKey = (key: string) => {
    return tagSearchKeys?.find((t) => t.key === key)
  }

  const handleSelectedTagChanged = (e) => {
    selectedTags = e.detail.tag

    const apiUrl = $page.url
    tagSearchKeys.forEach((key) => {
      apiUrl.searchParams.delete(key.key)
    })
    selectedTags?.forEach((t) => {
      apiUrl.searchParams.append(t.key, t.value)
    })
    fireChangeEvent(apiUrl)
    getTags(apiUrl)
  }
</script>

{#key selectedTags}
  <SelectedTags
    on:change={handleSelectedTagChanged}
    isClearButtonShown={true} />
{/key}

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
