<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import PublishedDatasets from '$components/data-upload/PublishedDatasets.svelte'
  import IngestingDatasets from '$components/data-upload/IngestingDatasets.svelte'
  import type { DatasetFeatureCollection, IngestingDataset } from '$lib/types'

  let datasets: DatasetFeatureCollection = $page.data.datasets
  let ingestingDatasets: IngestingDataset[] = $page.data.ingestingDatasets

  const gotoUploadPage = () => {
    goto(`/data/upload`)
  }

  const updateDatasets = () => {
    datasets = $page.data.datasets
    ingestingDatasets = $page.data.ingestingDatasets
  }
</script>

<p class="title align-center mb-4">Ingesting datasets</p>

<button
  class="button is-primary upload-button mb-2"
  on:click={gotoUploadPage}>
  <span class="icon">
    <i class="fa-solid fa-cloud-arrow-up" />
  </span>
  <span>Data upload</span>
</button>

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
