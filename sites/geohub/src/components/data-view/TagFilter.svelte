<script lang="ts">
  import { page } from '$app/stores'
  import { createEventDispatcher } from 'svelte'
  import type { Tag } from '$lib/types/Tag'
  import { onMount } from 'svelte'
  import { TreeView, TreeBranch, TreeLeaf } from 'svelte-tree-view-component'
  import { Button, Checkbox, Radios, Loader, type Radio } from '@undp-data/svelte-undp-design'
  import SelectedTags from './SelectedTags.svelte'
  import { getBulmaTagColor, getSelectedTagsFromUrl } from '$lib/helper'
  import Notification from '$components/controls/Notification.svelte'
  import { debounce } from 'lodash-es'
  import type { Country } from '$lib/types'
  import { TagSearchKeys } from '$lib/config/AppConfig'

  const dispatch = createEventDispatcher()

  export let isShow = false
  let tags: { [key: string]: Tag[] } = {}
  let filteredTags: { [key: string]: Tag[] } = {}
  let isLoading = false
  let selectedTags: Tag[] = getSelectedTagsFromUrl($page.url)
  let operatorType: 'and' | 'or' =
    ($page.url.searchParams.get('operator') as 'and' | 'or') ?? $page.data.config.TagSearchOperator
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
  export let query = ''
  let countriesMaster: Country[] = []
  $: isQueryEmpty = !query || query?.length === 0

  onMount(() => {
    init()
  })

  $: if (isShow === true) {
    // reload tags if tag panel is opened
    init()
  }

  export const init = async (url?: URL) => {
    const _url = url ?? $page.url
    await getCountries()
    await getTags(_url)
    selectedTags = [...getSelectedTagsFromUrl(_url)]
    handleFilterInput()
  }

  const getCountries = async () => {
    if (countriesMaster.length === 0) {
      const res = await fetch(`/api/countries`)
      const json = await res.json()
      countriesMaster = json as Country[]
    }
  }

  const getTags = async (newUrl: URL) => {
    try {
      isLoading = true

      const currentUrl = newUrl
      currentUrl.searchParams.delete('style')
      const apiUrl = `/api/tags${
        currentUrl.search ? `?url=${encodeURIComponent(`${currentUrl.origin}/api/datasets${currentUrl.search}`)}` : ''
      }`
      if (newUrl) {
        tags = {}
      }
      const res = await fetch(apiUrl)
      const json: { [key: string]: Tag[] } = await res.json()

      TagSearchKeys.forEach((t) => {
        if (!json[t.key]) return
        tags[t.key] = json[t.key]
      })
    } finally {
      isLoading = false
    }
  }

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
    TagSearchKeys.forEach((key) => {
      apiUrl.searchParams.delete(key.key)
    })
    fireChangeEvent(apiUrl)
    getTags(apiUrl)
    clearInput()
  }

  const getTagSearchKey = (key: string) => {
    return TagSearchKeys?.find((t) => t.key === key)
  }

  const handleSelectedTagChanged = (e) => {
    selectedTags = e.detail.tag

    const apiUrl = $page.url
    TagSearchKeys.forEach((key) => {
      apiUrl.searchParams.delete(key.key)
    })
    selectedTags?.forEach((t) => {
      apiUrl.searchParams.append(t.key, t.value)
    })
    fireChangeEvent(apiUrl)
    getTags(apiUrl)
  }

  const handleFilterInput = debounce(() => {
    if (query === '') {
      filteredTags = tags
    } else {
      filteredTags = {}
      Object.keys(tags).forEach((key) => {
        const res = tags[key].filter((t) => t.value.toLowerCase().indexOf(query.trim().toLowerCase()) !== -1)
        if (res.length === 0) return
        filteredTags[key] = res
      })
    }
  }, 500)

  const clearInput = () => {
    query = ''
    handleFilterInput()
  }

  const getLabel = (tag: Tag) => {
    if (tag.key === 'country') {
      const country = countriesMaster.find((c) => c.iso_3 === tag.value)
      return `${country.country_name} (${tag.value})`
    } else {
      return tag.value
    }
  }
</script>

<div class="control has-icons-left filter-text-box my-2">
  <input
    data-testid="filter-bucket-input"
    class="input"
    type="text"
    placeholder="Type keyword to search tags"
    on:input={handleFilterInput}
    bind:value={query} />
  <span class="icon is-small is-left">
    <i class="fas fa-search" />
  </span>
  {#if !isQueryEmpty}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
      class="clear-button"
      on:click={clearInput}>
      <i class="fas fa-xmark sm" />
    </span>
  {/if}
</div>

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
    {#if isLoading}
      <div
        hidden={!isLoading}
        class="loader-container">
        <Loader size="small" />
      </div>
    {:else if Object.keys(filteredTags).length > 0}
      {#key selectedTags}
        {#if TagSearchKeys}
          {#each Object.keys(filteredTags) as key}
            <TreeBranch
              rootContent={getTagSearchKey(key).label}
              defaultClosed={checkChildrenTicked(key)}>
              {#if filteredTags[key]}
                {#each filteredTags[key] as tag}
                  <TreeLeaf>
                    <Checkbox
                      label="{getLabel(tag)} ({tag.count})"
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
    {:else}
      <Notification
        type="info"
        showCloseButton={false}>No tag found</Notification>
    {/if}
  </TreeView>
</div>

<div class="container pb-2">
  <Radios
    bind:radios={operatorTypes}
    bind:value={operatorType}
    on:change={handleOperatorChanged}
    groupName="operator"
    isVertical={true} />
</div>

{#if selectedTags?.length > 0}
  <Button
    title="Clear all tags"
    on:clicked={clearAllTags} />
{/if}

<style lang="scss">
  .filter-text-box {
    display: flex;
    position: relative;
    height: 35px;
    width: 100%;

    .clear-button {
      position: absolute;
      top: 6px;
      right: 8px;
      cursor: pointer;
    }
  }

  .subtitle {
    border-bottom: 1px solid gray;
    font-weight: bold;
  }

  .box {
    position: relative;
    height: 200px;
    overflow-y: auto;
    border: 1px solid gray;

    .loader-container {
      width: max-content;
      margin: auto;
    }
  }

  .clear-tag-button {
    width: 100%;
  }
</style>
