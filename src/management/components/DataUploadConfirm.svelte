<script lang="ts">
  import type { Metadata, SDG, UploadFiles } from '../interfaces'
  import prettyBytes from 'pretty-bytes'
  import { MetadataConfig } from '../constants'

  export let selectedFiles: UploadFiles
  export let selectedSDG: SDG
  export let metadata: Metadata
</script>

<div class="columns mx-5 is-vcentered">
  <div class="column is-full is-centered">
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th>Item</th>
          <th>Data</th>
        </tr>
      </thead>
      <tr>
        <td>Files</td>
        <td>
          <ul>
            {#each selectedFiles.accepted as file}
              <li>{`${file.name} (${prettyBytes(file.size)})`}</li>
            {/each}
          </ul>
        </td>
      </tr>
      <tr>
        <td>Sustainable Development Goal</td>
        <td>
          {`${selectedSDG.number} - ${selectedSDG.name}`}
        </td>
      </tr>
      {#each Object.keys(metadata) as key}
        {#if metadata[key]}
          <tr>
            <td>{MetadataConfig[key].title}</td>
            <td>
              {metadata[key]}
            </td>
          </tr>
        {/if}
      {/each}
    </table>
  </div>
</div>

<style lang="scss">
</style>
