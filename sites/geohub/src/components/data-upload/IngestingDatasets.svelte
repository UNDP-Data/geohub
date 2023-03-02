<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation'
  import { fade } from 'svelte/transition'
  import { filesize } from 'filesize'
  import type { IngestingDataset } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import Time from 'svelte-time/src/Time.svelte'
  import { downloadFile, removeSasTokenFromDatasetUrl } from '$lib/helper'
  import { createEventDispatcher } from 'svelte'
  import DataUploadButton from './DataUploadButton.svelte'
  import DataPreview from './DataPreview.svelte'
  const dispatch = createEventDispatcher()

  export let datasets: IngestingDataset[]
  let expanded: { [key: string]: boolean } = {}
  let expandedDatasetId: string
  let confirmDeleteDialogVisible = false
  let cancelledDataset: IngestingDataset = undefined
  let isCancelling = false
  let ErrorDialogVisible = false
  let errorText = ''

  // const headerTitles: string[] = ['Data file', 'Status', 'Size', 'Date uploaded', 'Operation']

  const headerTitles: { title?: string; abbr?: string; icon?: string }[] = [
    {
      title: 'Data file',
    },
    {
      title: 'Status',
    },
    {
      title: 'Preview',
      icon: 'fa-solid fa-map',
    },
    {
      title: 'Download',
      icon: 'fa-solid fa-download',
    },
    {
      title: 'Size',
    },
    {
      title: 'Date uploaded',
    },
    {
      title: 'Operation',
    },
  ]

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

  const gotoEditMetadataPage = (url: string) => {
    const url4edit = removeSasTokenFromDatasetUrl(url)
    goto(`/data/publish?url=${url4edit}`)
  }

  const handleEnterKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      e.target.click()
    }
  }

  const getStatus = (dataset: IngestingDataset) => {
    if (dataset.raw.error) {
      return 'Error'
    }
    if (dataset.datasets && dataset.datasets.length > 0) {
      const published = dataset.datasets?.filter((ds) => ds.processing !== true)
      if (dataset.datasets?.length === published?.length) {
        return 'Published'
      }
      return 'Ingested'
    } else {
      return 'Ingestng'
    }
  }

  const handleCancelDataset = async () => {
    if (!cancelledDataset) return

    try {
      isCancelling = true

      const urls: string[] = [cancelledDataset.raw.url]
      if (cancelledDataset.raw.error) {
        urls.push(cancelledDataset.raw.error)
      }
      cancelledDataset?.datasets?.forEach((ds) => {
        urls.push(ds.url)
        if (ds.processing === true && ds.processingFile) {
          urls.push(ds.processingFile)
        }
      })
      for (const url of urls) {
        const res = await fetch(url, {
          method: 'DELETE',
        })
        if (!res.ok) {
          throw new Error(`Failed to delete ${url}`)
        }
      }

      await invalidateAll()
      dispatch('change')
      confirmDeleteDialogVisible = false
    } finally {
      isCancelling = false
    }
  }

  const openCancelDialog = (dataset: IngestingDataset) => {
    cancelledDataset = dataset
    confirmDeleteDialogVisible = true
  }

  const closeCancelDialog = () => {
    confirmDeleteDialogVisible = false
    cancelledDataset = undefined
  }

  const showErrorDialog = async (errorFile: string) => {
    const res = await fetch(errorFile)
    errorText = await res.text()
    ErrorDialogVisible = true
  }

  const closeErrorlDialog = () => {
    ErrorDialogVisible = false
    errorText = ''
  }

  const handleDownloadClicked = (url: string) => {
    downloadFile(url.replace('pmtiles://', ''))
  }
</script>

{#if datasets && datasets.length > 0}
  <div class="table-container">
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          {#each headerTitles as title}
            <th>
              {#if title.icon}
                <div class="is-flex is-align-items-center">
                  <i class={title.icon} />
                  {#if title.title}
                    <p class="pl-1">{title.title}</p>
                  {/if}
                </div>
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
        {#each datasets as dataset}
          {@const status = getStatus(dataset)}
          {#if status !== 'Published'}
            <tr>
              <td>
                <div class="is-flex is-align-items-center">
                  {#if status === 'Ingested'}
                    <div
                      class="pr-2"
                      on:click={() => {
                        expanded[dataset.raw.name] = !expanded[dataset.raw.name]
                      }}
                      on:keydown={handleEnterKey}>
                      <i
                        class="expand-button has-text-primary fa-solid fa-lg {expanded[dataset.raw.name] === true
                          ? 'fa-angle-down'
                          : 'fa-chevron-right'}" />
                    </div>
                  {:else}
                    <i class="fa-solid fa-file has-text-primary fa-lg pr-2" />
                  {/if}
                  {dataset.raw.name}
                </div>
              </td>
              <td class="fit-content">
                <div class="is-flex is-align-items-center">
                  {status}
                  {#if status === 'Error'}
                    <div
                      class="pl-2 icon error-dialog-button"
                      on:click={() => {
                        showErrorDialog(dataset.raw.error)
                      }}
                      on:keydown={handleEnterKey}>
                      <i class="fa-solid fa-arrow-up-right-from-square fa-lg has-text-primary" />
                    </div>
                  {/if}
                </div>
              </td>
              <td class="fit-content">
                <DataPreview
                  bind:id={dataset.raw.id}
                  bind:url={dataset.raw.url} />
              </td>
              <td class="fit-content">
                <button
                  class="button is-primary table-button is-small"
                  on:click={() => {
                    handleDownloadClicked(dataset.raw.url)
                  }}>
                  <span class="icon">
                    <i class="fa-solid fa-download" />
                  </span>
                  <span>Download</span>
                </button>
              </td>
              <td class="fit-content">{filesize(dataset.raw.contentLength, { round: 1 })}</td>
              <td class="fit-content">
                <Time
                  timestamp={dataset.raw.createdat}
                  format="h:mm A · MMMM D, YYYY" />
              </td>
              <td class="fit-content">
                <button
                  class="button is-link my-1 table-button is-small"
                  on:click={() => {
                    openCancelDialog(dataset)
                  }}>
                  <span class="icon">
                    <i class="fa-solid fa-xmark fa-lg" />
                  </span>
                  <span>Cancel</span>
                </button>
              </td>
            </tr>
            {#if dataset.datasets && expanded[dataset.raw.name] === true}
              {#each dataset.datasets as ds}
                <tr>
                  <td
                    ><div class="ml-4 is-flex is-align-items-center">
                      <i class="fa-solid fa-server has-text-primary pr-2" />
                      {ds.name}
                    </div></td>
                  <td class="fit-content">{ds.processing ? 'Unpublished' : 'Published'}</td>
                  <td class="fit-content">
                    <DataPreview
                      bind:id={ds.id}
                      bind:url={ds.url} />
                  </td>
                  <td class="fit-content">
                    <button
                      class="button is-primary table-button is-small"
                      on:click={() => {
                        handleDownloadClicked(ds.url)
                      }}>
                      <span class="icon">
                        <i class="fa-solid fa-download" />
                      </span>
                      <span>Download</span>
                    </button>
                  </td>
                  <td class="fit-content">{filesize(ds.contentLength, { round: 1 })}</td>
                  <td class="fit-content">
                    <Time
                      timestamp={ds.createdat}
                      format="h:mm A · MMMM D, YYYY" />
                  </td>
                  <td class="fit-content">
                    {#if ds.processing}
                      <button
                        class="button is-primary my-1 table-button is-small"
                        on:click={() => {
                          gotoEditMetadataPage(ds.url)
                        }}>
                        <span class="icon">
                          <i class="fa-solid fa-lock-open fa-lg" />
                        </span>
                        <span>Publish</span>
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            {/if}
          {/if}
        {/each}
      </tbody>

      <tfoot>
        <tr>
          {#each headerTitles as title}
            <th>
              {#if title.icon}
                <div class="is-flex is-align-items-center">
                  <i class={title.icon} />
                  {#if title.title}
                    <p class="pl-1">{title.title}</p>
                  {/if}
                </div>
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

  {#if confirmDeleteDialogVisible}
    <div
      class="modal is-active"
      transition:fade>
      <div
        class="modal-background"
        on:click={closeCancelDialog}
        on:keydown={handleEnterKey} />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Cancel data uploading</p>
          <button
            class="delete"
            aria-label="close"
            title="Close"
            on:click={closeCancelDialog} />
        </header>
        <section class="modal-card-body is-size-6 has-text-weight-normal">
          <div class="has-text-weight-medium">
            If continue, the following data uploading process will be cancelled. Do you want to continue?
          </div>
          <br />
          {cancelledDataset.raw.name}
        </section>
        <footer class="modal-card-foot">
          <div
            class="px-1"
            style="width: 50%">
            <button
              class="button is-link is-fullwidth"
              on:click={closeCancelDialog}>Cencel</button>
          </div>
          <div
            class="px-1"
            style="width: 50%">
            <button
              class="button is-primary is-fullwidth {isCancelling ? 'is-loading' : ''}"
              on:click={handleCancelDataset}>Continue</button>
          </div>
        </footer>
      </div>
    </div>
  {/if}

  {#if ErrorDialogVisible}
    <div
      class="modal is-active"
      transition:fade>
      <div
        class="modal-background"
        on:click={closeErrorlDialog}
        on:keydown={handleEnterKey} />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Error log</p>
          <button
            class="delete"
            aria-label="close"
            title="Close"
            on:click={closeErrorlDialog} />
        </header>
        <section class="modal-card-body is-size-6 has-text-weight-normal">
          <textarea
            class="textarea error-log"
            bind:value={errorText}
            readonly />
        </section>
        <footer class="modal-card-foot">
          <button
            class="button is-link is-fullwidth"
            on:click={closeErrorlDialog}>Close</button>
        </footer>
      </div>
    </div>
  {/if}
{:else}
  <Notification
    type="info"
    showCloseButton={false}>
    All datasets have already been processed and published! Do you want to upload new dataset? Click the below button!
    <br />
    <DataUploadButton />
  </Notification>
{/if}

<style lang="scss">
  .expand-button,
  .error-dialog-button {
    cursor: pointer;
  }

  .error-log {
    resize: none;
  }

  .fit-content {
    width: 0;
    white-space: nowrap;
  }
</style>
