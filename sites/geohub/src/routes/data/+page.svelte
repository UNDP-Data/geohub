<script lang="ts">
  import type { PageData } from './$types'
  import { invalidateAll } from '$app/navigation'
  import PublishedDatasets from '$components/data-upload/PublishedDatasets.svelte'
  import IngestingDatasets from '$components/data-upload/IngestingDatasets.svelte'
  import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types'
  import DataUploadButton from '$components/data-upload/DataUploadButton.svelte'

  export let data: PageData

  let datasets: Promise<DatasetFeatureCollection> = data.promises.datasets
  let ingestingDatasets: Promise<IngestingDataset[]> = data.promises.ingestingDatasets

  const updateDatasets = () => {
    datasets = data.promises.datasets
    ingestingDatasets = data.promises.ingestingDatasets
  }

  const handleRefresh = async () => {
    await invalidateAll()
    updateDatasets()
  }
</script>

<DataUploadButton />

<button
  class="button is-primary my-2"
  on:click={handleRefresh}>
  <span class="icon">
    <i class="fa-solid fa-rotate" />
  </span>
  <span>Refresh</span>
</button>

<p class="title align-center mb-4">Ingesting datasets</p>

<IngestingDatasets
  bind:datasets={ingestingDatasets}
  on:change={updateDatasets} />

<hr />

<p class="title align-center mb-4">My datasets</p>

<PublishedDatasets
  bind:datasets
  on:change={updateDatasets} />

<style lang="scss">
  .align-center {
    width: max-content;
    margin: auto;
  }
</style>
