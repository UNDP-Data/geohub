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

<Select bind:value={layer} label="Layer">
  {#each layers as l}
    <Option value={l}>{l}</Option>
  {/each}
</Select>
<Select bind:value={format} label="Format">
  {#each formats as f}
    <Option value={f}>{f}</Option>
  {/each}
</Select>
<br />
<br />
<Button variant="raised" on:click={download}>Download</Button>
<br />
<br />

<style lang="scss">
</style>
