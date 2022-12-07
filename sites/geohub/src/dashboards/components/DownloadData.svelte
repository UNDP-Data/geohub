<script lang="ts">
  import { downloadFile } from '$lib/helper'

  let layers = ['ADM0', 'ADM1', 'ADM2', 'ADM3', 'ADM4']
  let layer = 'ADM0'
  let formats = ['CSV', 'XLSX', 'GPKG', 'SHP']
  let format = 'CSV'

  const download = () => {
    const url = `https://data.undpgeohub.org/admin/${layer.toLowerCase()}_polygons.${format.toLowerCase()}.zip`
    downloadFile(url)
  }
</script>

<div style="display: block; width: 100%">
  <div class="select">
    <select bind:value={layer}>
      {#each layers as l}
        <option value={l}>{l}</option>
      {/each}
    </select>
  </div>
  <div class="select">
    <select bind:value={format}>
      {#each formats as f}
        <option value={f}>{f}</option>
      {/each}
    </select>
  </div>
</div>

<!-- svelte-ignore a11y-missing-attribute -->
<a
  class="button button-primary button-without-arrow"
  role="button"
  on:click={download}>
  Download
</a>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/buttons.min.css';

  .button {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }
</style>
