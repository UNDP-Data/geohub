<script lang="ts">
  import PublishedDatasets from '$components/data-upload/PublishedDatasets.svelte'
  import IngestingDatasets from '$components/data-upload/IngestingDatasets.svelte'
</script>

<p class="title align-center mb-4">Ingesting datasets</p>

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
