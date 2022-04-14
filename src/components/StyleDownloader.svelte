<script lang="ts">
  import Fa from 'svelte-fa'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'

  import { map } from '../stores'
  import { downloadFile } from '$lib/helper'

  export const download = () => {
    const style = $map.getStyle()
    const json = JSON.stringify(style, null, 2)
    const filename = `undp-geohub-map-layers-specification-${new Date().toISOString().split('T')[0]}.json`
    downloadFile(filename, json)
  }
</script>

<div class="icon" on:click={() => download()}>
  <Fa icon={faDownload} size="lg" />
</div>

<style lang="scss">
  .icon {
    cursor: pointer;
    margin-right: 20px;
  }
</style>
