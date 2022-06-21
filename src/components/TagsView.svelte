<script lang="ts">
  import { onMount } from 'svelte'
  import Tags from '$components/Tags.svelte'
  import Fa from 'svelte-fa'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'

  import { TabNames } from '$lib/constants'
  import { fetchUrl } from '$lib/helper'
  import type { TagsSearchResults } from '$lib/types'
  import { tags } from '$stores'

  let tagsList = []
  let groupedTagSearchResults = new Map()
  let showSpinner = false

  onMount(async () => {
    console.clear()
    $tags = (await fetchUrl('tags.json')).tags
  })

  const handleTags = (event: CustomEvent) => {
    tagsList = event.detail.tags
  }

  const handleSearchTags = async () => {
    console.log('handleSearchTags')
    showSpinner = true

    // sanitize selected tags
    const tagsListClean = $tags.filter((tag: string) => tagsList.includes(tag))
    tagsListClean.sort()

    // get search results
    const tagsSearchResultsResponse = (await fetchUrl(
      `tags-search.json?tags=${tagsListClean.toString()}`,
    )) as TagsSearchResults

    // group by container name
    groupedTagSearchResults = tagsSearchResultsResponse.results.blobs.reduce(
      (entryMap, e) => entryMap.set(e.container, [...(entryMap.get(e.container) || []), e]),
      new Map(),
    )

    // sort results by container name
    const sortedArray = [...groupedTagSearchResults].sort(([key1], [key2]) => key1.localeCompare(key2))
    groupedTagSearchResults = new Map(sortedArray)

    showSpinner = false
  }

  const handleClearTags = () => {
    console.log('handleClearTags')
    tagsList = []
  }
</script>

<div class="tags-view-container pl-5" data-testid="tags-view-container">
  <div class="title is-size-4">
    {TabNames.TAGS}
    <div class="is-divider separator mt-1 mb-1" />
  </div>
  <div class="columns search">
    <div class="column is-9 tags-list" style="position: relative; z-index: 10;">
      <Tags
        on:tags={handleTags}
        addKeys={[9, 13]}
        maxTags={4}
        splitWith={'/'}
        onlyUnique={true}
        removeKeys={[27]}
        placeholder={'Enter a keyword...'}
        autoComplete={$tags}
        tags={tagsList}
        allowBlur={true}
        disable={false}
        minChars={0}
        onlyAutocomplete={true}
        labelShow={false} />
    </div>
    <div class="column pl-0">
      <div class="columns is-gapless mb-3">
        <div class="column">
          <button class="button" disabled={tagsList.length > 0 ? false : true} on:click={handleSearchTags}
            >Search</button>
        </div>
      </div>
      <div class="columns is-gapless">
        <div class="column">
          <button class="button" disabled={tagsList.length > 0 ? false : true} on:click={handleClearTags}>Clear</button>
        </div>
      </div>
    </div>
  </div>

  <div class="columns tree pt-2">
    <div class="column">
      <div class="title is-size-4">
        Results
        <div class="is-divider separator mt-1 mb-1" />
      </div>
      {#if showSpinner}
        <div class="has-text-centered">
          <Fa icon={faSync} size="lg" spin />
        </div>
      {/if}

      {#if showSpinner === false && groupedTagSearchResults.size > 0}
        <div class="is-size-6">
          {#each Array.from(groupedTagSearchResults.keys()) as containerName}
            <ul class="mb-3">
              <li>
                <div class="has-text-weight-bold">{containerName}</div>
                <div>
                  <ul>
                    {#each groupedTagSearchResults.get(containerName) as layer}
                      <li>{layer?.label}</li>
                    {/each}
                  </ul>
                </div>
              </li>
            </ul>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .tags-view-container .button {
    width: 75px;
  }

  :global(.svelte-tags-input-layout) {
    height: 75px;
  }
</style>
