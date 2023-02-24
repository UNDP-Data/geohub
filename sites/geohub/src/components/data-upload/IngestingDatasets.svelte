<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { filesize } from 'filesize'
  import type { IngestingDataset } from '$lib/types'
  import Notification from '$components/controls/Notification.svelte'
  import Time from 'svelte-time/src/Time.svelte'

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
</script>

{#if datasets && datasets.length > 0}
  <div class="table-container">
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th />
          <th>Name</th>
          <th>Size</th>
          <th>Status</th>
          <th>Uploaded at</th>
          <th><i class="fa-solid fa-lock-open fa-lg" /> / <i class="fa-solid fa-lock fa-lg" /></th>
        </tr>
      </thead>

      <tbody>
        {#each datasets as dataset}
          <tr>
            <td>
              <div
                on:click={() => {
                  expanded[dataset.raw.name] = !expanded[dataset.raw.name]
                }}
                on:keydown={handleEnterKey}>
                <i
                  class="expand-button has-text-primary fa-solid {expanded[dataset.raw.name] === true
                    ? 'fa-angle-down'
                    : 'fa-chevron-right'}" />
              </div>
            </td>
            <td>{dataset.raw.name}</td>
            <td>{dataset.raw.error ? 'Error' : dataset.datasets?.length > 0 ? 'Ingested' : 'Ingesting'}</td>
            <td>{filesize(dataset.raw.contentLength, { round: 1 })}</td>
            <td>
              <Time
                timestamp={dataset.raw.createdat}
                format="h:mm A · MMMM D, YYYY" />
            </td>
            <td />
          </tr>
          {#if dataset.datasets && expanded[dataset.raw.name] === true}
            {#each dataset.datasets as ds}
              <tr>
                <td><i class="fa-solid fa-file has-text-primary" /></td>
                <td>{ds.name}</td>
                <td>{ds.processing ? 'Unpublished' : 'Published'}</td>
                <td>{filesize(ds.contentLength, { round: 1 })}</td>
                <td>
                  <Time
                    timestamp={ds.createdat}
                    format="h:mm A · MMMM D, YYYY" />
                </td>
                <td>
                  {#if ds.processing}
                    <button class="button is-primary my-1 table-button">
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
        {/each}
      </tbody>

      <tfoot>
        <tr>
          <th />
          <th>Name</th>
          <th>Size</th>
          <th>Status</th>
          <th>Uploaded at</th>
          <th><i class="fa-solid fa-lock-open fa-lg" /> / <i class="fa-solid fa-lock fa-lg" /></th>
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
