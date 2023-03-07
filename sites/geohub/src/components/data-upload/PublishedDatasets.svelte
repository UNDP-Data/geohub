<script lang="ts">
  import { fade } from 'svelte/transition'
  import { page } from '$app/stores'
  import { goto, invalidateAll } from '$app/navigation'
  import type { DatasetFeature, DatasetFeatureCollection } from '$lib/types'
  import { Pagination, Loader, Radios } from '@undp-data/svelte-undp-design'
  import { debounce } from 'lodash-es'
  import Notification from '$components/controls/Notification.svelte'
  import DataCardInfo from '$components/data-view/DataCardInfo.svelte'
  import { removeSasTokenFromDatasetUrl } from '$lib/helper'
  import Time from 'svelte-time/src/Time.svelte'
  import TagFilter from '$components/data-view/TagFilter.svelte'
  import PanelButton from '$components/controls/PanelButton.svelte'
  import { createEventDispatcher } from 'svelte'
  import MiniMap from '$components/data-view/MiniMap.svelte'
  import { DatasetSortingColumns, LimitOptions, Permission } from '$lib/AppConfig'
  const dispatch = createEventDispatcher()

  export let datasets: DatasetFeatureCollection
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
  let isDeleting = false

  let limit = $page.url.searchParams.get('limit')
  let offset = $page.url.searchParams.get('offset')
  let sortby = $page.url.searchParams.get('sortby')
  let query = $page.url.searchParams.get('query') ?? ''
  let confirmDeleteDialogVisible = false
  let deletedDataset: DatasetFeature = undefined
  let deletedDatasetName = ''
  let initTagfilter: (url?: URL) => Promise<void>
  let isTagFilterShow = false

  const headerTitles: { title?: string; abbr?: string; icon?: string }[] = [
    {
      title: '',
      abbr: '',
      icon: '',
    },
    {
      title: 'Dataset name',
    },
    {
      title: 'Data type',
      abbr: 'Type',
    },
    {
      title: 'Data License',
      abbr: 'License',
    },
    {
      title: 'Date created',
      abbr: 'Created at',
    },
    {
      title: 'Date updated',
      abbr: 'Updated at',
    },
    {
      icon: 'fa-solid fa-pen-to-square fa-lg',
    },
    {
      icon: 'fa-solid fa-trash fa-lg',
    },
  ]

  $: isQueryEmpty = !query || query?.length === 0

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
      dispatch('change')
    } finally {
      isLoading = false
    }
  }

  const handleFilterInput = debounce(async (e) => {
    query = (e.target as HTMLInputElement).value
    if (query.length > 0) {
      offset = '0'

      const link = datasets.links.find((l) => l.rel === 'self')
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
    const link = datasets.links.find((l) => l.rel === 'self')
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

      const link = datasets.links.find((l) => l.rel === 'self')
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

    const link = datasets.links?.find((l) => l.rel === 'self')
    if (link) {
      const href = new URL(link.href)
      href.searchParams.set('sortby', sortby)
      href.searchParams.set('offset', offset)
      await reload(href)
    }
  }

  const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
    const type = e.detail.type

    const link = datasets.links.find((l) => l.rel === type)
    if (link) {
      const href = new URL(link.href)
      await reload(href)
    }
  }

  const gotoEditMetadataPage = (url: string) => {
    const url4edit = removeSasTokenFromDatasetUrl(url)
    goto(`/data/publish?url=${url4edit}`)
  }

  const handleDeleteDataset = async () => {
    if (!deletedDataset) return
    try {
      isDeleting = true

      const res = await fetch(`/api/datasets/${deletedDataset.properties.id}`, {
        method: 'DELETE',
      })
      if (res.ok && res.status === 204) {
        const index = datasets.features.findIndex((f) => f.properties.id === deletedDataset.properties.id)
        if (index > -1) {
          datasets.features.splice(index, 1)
          datasets.features = [...datasets.features]
        }
        await invalidateAll()
        dispatch('change')
        closeDeleteDialog()
      }
    } finally {
      isDeleting = false
    }
  }

  const openDeleteDialog = (dataset: DatasetFeature) => {
    deletedDataset = dataset
    confirmDeleteDialogVisible = true
    deletedDatasetName = ''
    disableScroll()
  }

  const closeDeleteDialog = () => {
    confirmDeleteDialogVisible = false
    deletedDataset = undefined
    deletedDatasetName = ''
    enableScroll()
  }

  const disableScroll = () => {
    const root = document.documentElement
    root.classList.add('is-clipped')
  }

  const enableScroll = () => {
    const root = document.documentElement
    root.classList.remove('is-clipped')
  }

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }
</script>

<div class="datasets-header tile is-ancestor">
  <div class="tile is-parent">
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
        <div
          class="clear-button"
          on:click={clearInput}
          on:keydown={handleEnterKey}>
          <i class="fas fa-xmark sm" />
        </div>
      {/if}
    </div>

    <div class="field tag-filter">
      <PanelButton
        icon="fas fa-sliders"
        tooltip="Explore tags and filter data"
        bind:isShow={isTagFilterShow}
        width="300px">
        <p class="title is-5 m-0 p-0 pb-1">Explore by tags</p>
        <p class="has-text-weight-semibold">Explore tags and filter data by selecting them.</p>
        <TagFilter
          bind:init={initTagfilter}
          bind:isShow={isTagFilterShow}
          on:change={handleTagChanged} />
      </PanelButton>
    </div>

    <div class="field sort-control">
      <PanelButton
        icon="fas fa-arrow-down-short-wide"
        tooltip="Sort"
        width="200px">
        <p class="title is-5 m-0 p-0 pb-2">Sort settings</p>

        <Radios
          radios={DatasetSortingColumns}
          on:change={handleSortbyChanged}
          bind:value={sortby}
          groupName="sortby"
          isVertical={true} />
      </PanelButton>
    </div>

    <div class="field pl-1">
      <div class="select">
        <select
          bind:value={limit}
          on:change={handleLimitChanged}>
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
{:else if datasets.pages?.totalCount > 0}
  <div class="table-container">
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          {#each headerTitles as title}
            <th>
              {#if title.icon}
                <i class={title.icon} />
              {:else if title.abbr && title.title}
                <abbr
                  class="has-tooltip-arrow has-tooltip-bottom"
                  data-tooltip={title.title}
                  title={title.title}>{title.abbr}</abbr>
              {:else if title.title}
                {title.title}
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each datasets.features as feature}
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
            <td class="fit-content">{feature.properties.is_raster ? 'Raster' : 'Vector'}</td>
            <td>{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}</td>
            <td class="fit-content">
              <Time
                timestamp={feature.properties.createdat}
                format="hh:mm A, MM/DD/YYYY" />
              <br />
              {feature.properties.created_user}
            </td>
            <td class="fit-content">
              <Time
                timestamp={feature.properties.updatedat}
                format="hh:mm A, MM/DD/YYYY" />
              <br />
              {feature.properties.updated_user}
            </td>
            <td class="fit-content">
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
            <td class="fit-content">
              {#if feature.properties.permission > Permission.WRITE}
                <button
                  class="button is-link my-1 table-button"
                  on:click={() => {
                    openDeleteDialog(feature)
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
                <div class="columns is-vcentered">
                  <div class="column">
                    <DataCardInfo bind:feature />
                  </div>
                  <div class="column">
                    <MiniMap
                      bind:feature
                      isLoadMap={expanded[feature.properties.id] === true}
                      width="100%"
                      height="300px" />
                  </div>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
      <tfoot>
        <tr>
          {#each headerTitles as title}
            <th>
              {#if title.icon}
                <i class={title.icon} />
              {:else if title.abbr && title.title}
                <abbr
                  class="has-tooltip-arrow has-tooltip-bottom"
                  data-tooltip={title.title}
                  title={title.title}>{title.abbr}</abbr>
              {:else if title.title}
                {title.title}
              {/if}
            </th>
          {/each}
        </tr>
      </tfoot>
    </table>
  </div>
  <div class="align-center pt-2">
    <Pagination
      bind:totalPages={datasets.pages.totalPages}
      bind:currentPage={datasets.pages.currentPage}
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
    transition:fade>
    <div
      class="modal-background"
      on:click={closeDeleteDialog}
      on:keydown={handleEnterKey} />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Are you sure deleting the dataset?</p>
        <button
          class="delete"
          aria-label="close"
          title="Close"
          on:click={closeDeleteDialog} />
      </header>
      <section class="modal-card-body is-size-6 has-text-weight-normal">
        <Notification
          type="warning"
          showCloseButton={false}>
          Unexpected bad things will happen if you don't read this!
        </Notification>
        <div class="has-text-weight-medium mt-2 mx-1">
          This action <b>cannot</b> be undone. This will delete <b>{deletedDataset.properties.name}</b> from GeoHub data
          catalogue. It will not be searchable again from Data tab in GeoHub app.
          <br />
          Please type <b>{deletedDataset.properties.name}</b> to confirm.
        </div>
        <br />
        <input
          class="input"
          type="text"
          bind:value={deletedDatasetName} />
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-primary is-fullwidth {isDeleting ? 'is-loading' : ''}"
          on:click={handleDeleteDataset}
          disabled={deletedDatasetName !== deletedDataset.properties.name}>
          I understand the consequences, delete this dataset
        </button>
      </footer>
    </div>
  </div>
{/if}

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

  .fit-content {
    width: 0;
    white-space: nowrap;
  }

  .expand-button {
    cursor: pointer;
  }
</style>
