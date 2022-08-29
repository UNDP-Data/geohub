<script lang="ts">
  import Select, { Option } from '@smui/select'
  import Button from '@smui/button'
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

<br />
<br />
<Button style="background:#D12800; color:white; border-radius: 0" on:click={download}>Download</Button>
<!--<br />-->

<!--<br />-->
<style lang="scss">
</style>
