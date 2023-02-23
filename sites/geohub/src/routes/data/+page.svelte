<script lang="ts">
  import { fade } from 'svelte/transition'
  import { page } from '$app/stores'
  import { goto, invalidateAll } from '$app/navigation'
  import { clickOutside } from 'svelte-use-click-outside'
  import type { DatasetFeature, DatasetFeatureCollection } from '$lib/types'
  import { Pagination, Loader, Button, Radios } from '@undp-data/svelte-undp-design'
  import { DEFAULT_LIMIT, LimitOptions, Permission, SortingColumns } from '$lib/constants'
  import { debounce } from 'lodash-es'
  import Notification from '$components/controls/Notification.svelte'
  import DataCardInfo from '$components/data-view/DataCardInfo.svelte'
  import { removeSasTokenFromDatasetUrl } from '$lib/helper'
  import Time from 'svelte-time/src/Time.svelte'
  import TagFilter from '$components/data-view/TagFilter.svelte'
  import PanelButton from '$components/controls/PanelButton.svelte'

  let fc: DatasetFeatureCollection = $page.data.features
  let expanded: { [key: string]: boolean } = {}
  let expandedDatasetId: string
  $: {
    let expandedDatasets = Object.keys(expanded).filter((key) => expanded[key] === true && key !== expandedDatasetId)
    if (expandedDatasets.length > 0) {
      expandedDatasetId = expandedDatasets[0]
      Object.keys(expanded)
        .filter((key) => key !== expandedDatasetId)
        .forEach((key) => {
          expanded[key] = false
        })
      expanded[expandedDatasets[0]] = true
    }
  }

  let isLoading = false

  let limit = $page.url.searchParams.get('limit') ? $page.url.searchParams.get('limit') : `${DEFAULT_LIMIT}`
  let offset = $page.url.searchParams.get('offset') ? $page.url.searchParams.get('offset') : '0'
  let sortby = $page.url.searchParams.get('sortby') ? $page.url.searchParams.get('sortby') : 'name,asc'
  let query = $page.url.searchParams.get('query') ?? ''
  let confirmDeleteDialogVisible = false
  let deletedDataset: DatasetFeature = undefined
  let initTagfilter: (url?: URL) => Promise<void>
  $: isQueryEmpty = !query || query?.length === 0

  $: limit, handleLimitChanged()
  $: sortby, handleSortbyChanged()

  const reload = async (url: URL) => {
    try {
      isLoading = true
      await goto(`?${url.searchParams.toString()}`, {
        invalidateAll: true,
        noScroll: true,
      })
      if (initTagfilter) {
        await initTagfilter(url)
      }
      fc = $page.data.features
    } finally {
      isLoading = false
    }
  }

  const handleFilterInput = debounce(async (e) => {
    query = (e.target as HTMLInputElement).value
    if (query.length > 0) {
      offset = '0'

      const link = fc.links.find((l) => l.rel === 'self')
      if (link) {
        const href = new URL(link.href)
        href.searchParams.set('query', query.trim())
        href.searchParams.set('queryoperator', 'and')
        href.searchParams.set('offset', offset)
        await reload(href)
      }
    }
  }, 500)

  const clearInput = async () => {
    if (isQueryEmpty === true) return
    query = ''
    offset = '0'
    const link = fc.links.find((l) => l.rel === 'self')
    if (link) {
      const href = new URL(link.href)
      href.searchParams.delete('query')
      href.searchParams.set('offset', offset)
      await reload(href)
    }
  }

  const handleLimitChanged = async () => {
    const currentLimit = $page.url.searchParams.get('limit') ? $page.url.searchParams.get('limit') : undefined
    if (currentLimit && currentLimit !== limit) {
      offset = '0'

      const link = fc.links.find((l) => l.rel === 'self')
      if (link) {
        const href = new URL(link.href)
        href.searchParams.set('limit', limit)
        href.searchParams.set('offset', offset)
        await reload(href)
      }
    }
  }

  const handleTagChanged = async (e) => {
    const url = new URL(e.detail.url)
    await reload(url)
  }

  const handleSortbyChanged = async () => {
    offset = '0'

    const link = fc.links?.find((l) => l.rel === 'self')
    if (link) {
      const href = new URL(link.href)
      href.searchParams.set('sortby', sortby)
      href.searchParams.set('offset', offset)
      await reload(href)
    }
  }

  const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
    const type = e.detail.type

    const link = fc.links.find((l) => l.rel === type)
    if (link) {
      const href = new URL(link.href)
      await reload(href)
    }
  }

  const gotoEditMetadataPage = (url: string) => {
    const url4edit = removeSasTokenFromDatasetUrl(url)
    goto(`/data/publish?url=${url4edit}`)
  }

  const gotoUploadPage = () => {
    goto(`/data/upload`)
  }

  const handleDeleteDataset = async () => {
    if (!deletedDataset) return
    const res = await fetch(`/api/datasets/${deletedDataset.properties.id}`, {
      method: 'DELETE',
    })
    if (res.ok && res.status === 204) {
      const index = fc.features.findIndex((f) => f.properties.id === deletedDataset.properties.id)
      if (index > -1) {
        fc.features.splice(index, 1)
        fc.features = [...fc.features]
      }
      confirmDeleteDialogVisible = false
      await invalidateAll()
      fc = $page.data.features
    }
  }

  const closeDeleteDialog = () => {
    confirmDeleteDialogVisible = false
    deletedDataset = undefined
  }

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }
</script>

<p class="title align-center mb-4">My datasets</p>

<div class="datasets-header tile is-ancestor">
  <div class="tile is-parent">
    <button
      class="button is-primary upload-button"
      on:click={gotoUploadPage}>
      <span class="icon">
        <i class="fa-solid fa-cloud-arrow-up" />
      </span>
      <span>Data upload</span>
    </button>

    <div class="control has-icons-left filter-text-box pl-1">
      <input
        data-testid="filter-bucket-input"
        class="input"
        type="text"
        placeholder="Type keywords"
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

    <div class="field tag-filter">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <!-- <label class="label">Tags:</label> -->
      <PanelButton
        icon="fas fa-sliders"
        tooltip="Explore tags and filter data"
        width="230px">
        <p class="title is-5 m-0 p-0 pb-1">Explore by tags</p>
        <p class="has-text-weight-semibold">Explore tags and filter data by selecting them.</p>
        <TagFilter
          bind:init={initTagfilter}
          on:change={handleTagChanged} />
      </PanelButton>
    </div>

    <div class="field sort-control">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <!-- <label class="label">Order by:</label> -->
      <PanelButton
        icon="fas fa-arrow-down-short-wide"
        tooltip="Sort"
        width="200px">
        <p class="title is-5 m-0 p-0 pb-2">Sort settings</p>

        <Radios
          radios={SortingColumns}
          bind:value={sortby}
          groupName="sortby"
          isVertical={true} />
      </PanelButton>
    </div>

    <div class="field pl-1">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <div class="select">
        <select bind:value={limit}>
          {#each LimitOptions as limit}
            <option value={`${limit}`}>{limit}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>

{#if isLoading}
  <div class="align-center my-4">
    <Loader />
  </div>
{:else if fc.pages?.totalCount > 0}
  <div class="table-container">
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th />
          <th>Name</th>
          <th><abbr title="Data type">Type</abbr></th>
          <th>License</th>
          <th>Created at</th>
          <th>Updated at</th>
          <th><i class="fa-solid fa-pen-to-square fa-lg" /></th>
          <th><i class="fa-solid fa-trash fa-lg" /></th>
        </tr>
      </thead>
      <tbody>
        {#each fc.features as feature}
          <tr>
            <td>
              <div
                on:click={() => {
                  expanded[feature.properties.id] = !expanded[feature.properties.id]
                }}
                on:keydown={handleEnterKey}>
                <i
                  class="expand-button has-text-primary fa-solid {expanded[feature.properties.id] === true
                    ? 'fa-angle-down'
                    : 'fa-chevron-right'}" />
              </div>
            </td>
            <td>{feature.properties.name}</td>
            <td>{feature.properties.is_raster ? 'Raster' : 'Vector'}</td>
            <td>{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}</td>
            <td>
              <Time
                timestamp={feature.properties.createdat}
                format="h:mm A · MMMM D, YYYY" />
              <br />
              {feature.properties.created_user}
            </td>
            <td>
              <Time
                timestamp={feature.properties.updatedat}
                format="h:mm A · MMMM D, YYYY" />
              <br />
              {feature.properties.updated_user}
            </td>
            <td>
              {#if feature.properties.permission > Permission.READ}
                <button
                  class="button is-primary my-1 table-button"
                  on:click={() => {
                    gotoEditMetadataPage(feature.properties.url)
                  }}>
                  <span class="icon">
                    <i class="fa-solid fa-pen-to-square" />
                  </span>
                </button>
              {:else}
                <p>-</p>
              {/if}
            </td>
            <td>
              {#if feature.properties.permission > Permission.WRITE}
                <button
                  class="button is-link my-1 table-button"
                  on:click={() => {
                    confirmDeleteDialogVisible = true
                    deletedDataset = feature
                  }}>
                  <span class="icon">
                    <i class="fa-solid fa-trash" />
                  </span>
                </button>
              {:else}
                <p>-</p>
              {/if}
            </td>
          </tr>
          {#if expanded[feature.properties.id] === true}
            <tr>
              <td colspan="8">
                <DataCardInfo bind:feature />
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
      <tfoot>
        <tr>
          <th />
          <th>Name</th>
          <th><abbr title="Data type">Type</abbr></th>
          <th>License</th>
          <th>Created at</th>
          <th>Updated at</th>
          <th><i class="fa-solid fa-pen-to-square fa-lg" /></th>
          <th><i class="fa-solid fa-trash fa-lg" /></th>
        </tr>
      </tfoot>
    </table>
  </div>
  <div class="align-center pt-2">
    <Pagination
      bind:totalPages={fc.pages.totalPages}
      bind:currentPage={fc.pages.currentPage}
      on:clicked={handlePaginationClicked} />
  </div>
{:else}
  <Notification
    type="info"
    showCloseButton={false}>No datasets found</Notification>
{/if}

{#if confirmDeleteDialogVisible}
  <div
    class="modal is-active"
    transition:fade
    use:clickOutside={closeDeleteDialog}>
    <div class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Delete dataset</p>
        <button
          class="delete"
          aria-label="close"
          title="Close"
          on:click={closeDeleteDialog} />
      </header>
      <section class="modal-card-body is-size-6 has-text-weight-normal">
        <div class="has-text-weight-medium">Are you sure you want to delete this dataset?</div>
        <br />
        {deletedDataset.properties.name}
      </section>
      <footer class="modal-card-foot">
        <div
          class="px-1"
          style="width: 50%">
          <Button
            title="Cancel"
            isPrimary={false}
            on:clicked={closeDeleteDialog} />
        </div>
        <div
          class="px-1"
          style="width: 50%">
          <Button
            title="Delete"
            isPrimary={true}
            on:clicked={handleDeleteDataset} />
        </div>
      </footer>
    </div>
  </div>
{/if}

<hr />

<p class="title align-center mb-4">Processing datasets</p>

<Notification
  type="info"
  showCloseButton={false}>
  All datasets have already been processed and published! Do you want to upload new dataset? Click the below button!
  <br />
  <button
    class="button is-primary upload-button my-2"
    on:click={gotoUploadPage}>
    <span class="icon">
      <i class="fa-solid fa-cloud-arrow-up" />
    </span>
    <span>Data upload</span>
  </button>
</Notification>

<style lang="scss">
  .align-center {
    width: max-content;
    margin: auto;
  }

  .datasets-header {
    width: fit-content;
    margin-left: auto;

    .filter-text-box {
      position: relative;
      height: 35px;
      width: 200px;

      .clear-button {
        position: absolute;
        top: 0.5rem;
        right: 1rem;
        cursor: pointer;
      }
    }
  }

  .expand-button {
    cursor: pointer;
  }
</style>
