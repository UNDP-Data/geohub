<script lang="ts">
  import { getBulmaTagColor, initTippy } from '$lib/helper'
  import type { Tag } from '$lib/types'
  import { debounce } from 'lodash-es'
  import { hideAll } from 'tippy.js'
  import Notification from '$components/controls/Notification.svelte'
  import SelectedTags from '$components/data-view/SelectedTags.svelte'

  const tippy = initTippy()
  let tooltipContent: HTMLElement

  const TAG_KEY = 'provider'

  export let tags: Tag[] = []

  let tagList: Tag[]
  let filterTagList: Tag[] = []
  let query = ''

  const getTags = async () => {
    const res = await fetch(`/api/tags?key=${TAG_KEY}`)
    const json = await res.json()
    let _tags: Tag[] = []
    if (json[TAG_KEY]) {
      _tags = json[TAG_KEY]
    }
    tagList = [..._tags]
    filterTagList = [...tagList]
  }

  let loadingTags = getTags()

  $: query, handleSearch()
  const handleSearch = debounce(() => {
    if (query.length === 0) {
      filterTagList = tagList
    } else {
      filterTagList = tagList.filter((t) => t.value.toLowerCase().indexOf(query.toLowerCase()) !== -1)
    }
  }, 300)

  const handleTagClicked = (value: Tag) => {
    if (!tags.find((t) => t.value === value.value)) {
      value.color = getBulmaTagColor()
      tags = [...tags, value]
    }
    hideAll()
  }

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }
</script>

<div
  class="country-select-button pr-2"
  use:tippy={{ content: tooltipContent }}>
  <div class="box p-2">
    <span class="icon is-large">
      <i class="fa-solid fa-magnifying-glass fa-2xl" />
    </span>
  </div>
</div>

<div
  class="tooltip p-2"
  data-testid="tooltip"
  bind:this={tooltipContent}>
  <nav
    class="panel tooltip"
    bind:this={tooltipContent}>
    <p class="panel-heading">Data providers</p>
    <div class="panel-block">
      <p class="control has-icons-left">
        <input
          class="input"
          type="text"
          placeholder="Type name to search tags"
          bind:value={query} />
        <span class="icon is-left">
          <i
            class="fas fa-search"
            aria-hidden="true" />
        </span>
        {#if query.length > 0}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span
            class="clear-button"
            on:click={() => (query = '')}>
            <i class="fas fa-xmark sm" />
          </span>
        {/if}
      </p>
    </div>
    <div class="tag-list">
      {#await loadingTags then}
        {#if filterTagList?.length > 0}
          {#each filterTagList as t}
            <!-- svelte-ignore a11y-missing-attribute -->
            <a
              class="panel-block"
              on:click={() => {
                handleTagClicked(t)
              }}
              on:keydown={handleEnterKey}>
              <span class="panel-icon">
                <i
                  class="fa-solid fa-tag"
                  aria-hidden="true" />
              </span>
              {t.value} ({t.count})
            </a>
          {/each}
        {:else}
          <div class="p-2">
            <Notification
              type="info"
              showCloseButton={false}>
              No provider found. Try another keyword.
            </Notification>
          </div>
        {/if}
      {/await}
    </div>
  </nav>
</div>

<div class="provider-selected pt-2 is-flex is-align-content-center">
  <SelectedTags
    bind:selectedTags={tags}
    isClearButtonShown={true} />
</div>

<style lang="scss">
  @import 'tippy.js/dist/tippy.css';
  @import 'tippy.js/themes/light.css';

  .country-select-button {
    width: fit-content;
    cursor: pointer;
  }

  .tooltip {
    max-width: 300px;

    .clear-button {
      position: absolute;
      top: 0.6rem;
      right: 0.8rem;
      cursor: pointer;
      color: gray;
    }

    .tag-list {
      max-height: 250px;
      overflow-y: auto;
    }
  }
</style>
