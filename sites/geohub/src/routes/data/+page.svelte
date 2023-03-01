<script lang="ts">
  import { page } from '$app/stores'
  import PublishedDatasets from '$components/data-upload/PublishedDatasets.svelte'
  import IngestingDatasets from '$components/data-upload/IngestingDatasets.svelte'
  import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types'
  import DataUploadButton from '$components/data-upload/DataUploadButton.svelte'

  let datasets: DatasetFeatureCollection = $page.data.datasets
  let ingestingDatasets: IngestingDataset[] = $page.data.ingestingDatasets

  const updateDatasets = () => {
    datasets = $page.data.datasets
    ingestingDatasets = $page.data.ingestingDatasets
  }
</script>

<p class="title align-center mb-4">Ingesting datasets</p>

<DataUploadButton />

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
