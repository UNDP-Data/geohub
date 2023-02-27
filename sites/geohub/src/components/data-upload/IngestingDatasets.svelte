<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { filesize } from 'filesize'
  import type { IngestingDataset } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import Time from 'svelte-time/src/Time.svelte'
  import { removeSasTokenFromDatasetUrl } from '$lib/helper'

  let datasets: IngestingDataset[] = $page.data.ingestingDatasets
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

  const gotoEditMetadataPage = (url: string) => {
    const url4edit = removeSasTokenFromDatasetUrl(url)
    goto(`/data/publish?url=${url4edit}`)
  }

  const gotoUploadPage = () => {
    goto(`/data/upload`)
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
</script>

{#if datasets && datasets.length > 0}
  <div class="table-container">
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>Data file</th>
          <th>Status</th>
          <th>Size</th>
          <th>Date uploaded</th>
          <th>Operation</th>
        </tr>
      </thead>

      <tbody>
        {#each datasets as dataset}
          {@const status = getStatus(dataset)}
          {#if status !== 'Published'}
            <tr>
              <td>
                <div class="is-flex">
                  {#if status === 'Ingested'}
                    <div
                      class="pr-2"
                      on:click={() => {
                        expanded[dataset.raw.name] = !expanded[dataset.raw.name]
                      }}
                      on:keydown={handleEnterKey}>
                      <i
                        class="expand-button has-text-primary fa-solid {expanded[dataset.raw.name] === true
                          ? 'fa-angle-down'
                          : 'fa-chevron-right'}" />
                    </div>
                  {:else}
                    <i class="fa-solid fa-file has-text-primary pr-2" />
                  {/if}
                  {dataset.raw.name}
                </div>
              </td>
              <td>{status}</td>
              <td>{filesize(dataset.raw.contentLength, { round: 1 })}</td>
              <td>
                <Time
                  timestamp={dataset.raw.createdat}
                  format="h:mm A · MMMM D, YYYY" />
              </td>
              <td>
                <button class="button is-link my-1 table-button">
                  <span class="icon">
                    <i class="fa-solid fa-trash fa-lg" />
                  </span>
                  <span>Delete</span>
                </button>
              </td>
            </tr>
            {#if dataset.datasets && expanded[dataset.raw.name] === true}
              {#each dataset.datasets as ds}
                <tr>
                  <td><div class="ml-4 is-flex"><i class="fa-solid fa-file has-text-primary pr-2" />{ds.name}</div></td>
                  <td>{ds.processing ? 'Unpublished' : 'Published'}</td>
                  <td>{filesize(ds.contentLength, { round: 1 })}</td>
                  <td>
                    <Time
                      timestamp={ds.createdat}
                      format="h:mm A · MMMM D, YYYY" />
                  </td>
                  <td>
                    {#if ds.processing}
                      <button
                        class="button is-primary my-1 table-button"
                        on:click={() => {
                          gotoEditMetadataPage(ds.url)
                        }}>
                        <span class="icon">
                          <i class="fa-solid fa-lock-open fa-lg" />
                        </span>
                        <span>Publish</span>
                      </button>
                    {:else}
                      <button class="button is-link my-1 table-button">
                        <span class="icon">
                          <i class="fa-solid fa-lock fa-lg" />
                        </span>
                        <span>Unpublish</span>
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
          <th>File name</th>
          <th>Status</th>
          <th>Size</th>
          <th>Uploaded at</th>
          <th>Operation</th>
        </tr>
      </tfoot>
    </table>
  </div>
{:else}
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
{/if}

<style lang="scss">
</style>
