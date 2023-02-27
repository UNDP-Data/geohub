<script lang="ts">
  import { goto } from '$app/navigation'
  import PublishedDatasets from '$components/data-upload/PublishedDatasets.svelte'
  import IngestingDatasets from '$components/data-upload/IngestingDatasets.svelte'

  const gotoUploadPage = () => {
    goto(`/data/upload`)
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

<IngestingDatasets />

<hr />

<p class="title align-center mb-4">My datasets</p>

<PublishedDatasets />

<style lang="scss">
  .align-center {
    width: max-content;
    margin: auto;
  }
</style>
