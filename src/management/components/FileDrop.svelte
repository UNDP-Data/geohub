<script lang="ts">
  import Dropzone from 'svelte-file-dropzone'
  import prettyBytes from 'pretty-bytes'
  import type { UploadFiles } from '../interfaces'

  export let files: UploadFiles = {
    accepted: [],
    rejected: [],
  }

  function handleFilesSelect(e) {
    const { acceptedFiles, fileRejections } = e.detail
    files.accepted = [...files.accepted, ...acceptedFiles]
    files.rejected = [...files.rejected, ...fileRejections]
  }
</script>

<div class="columns mx-5 is-vcentered is-multiline">
  <div class="column is-full is-centered">
    <Dropzone on:drop={handleFilesSelect} />
  </div>
  {#if files && files.accepted && files.accepted.length > 0}
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth mx-3">
      <thead>
        <tr>
          <th>File name</th>
          <th>Size</th>
          <th>Last modified</th>
        </tr>
      </thead>
      {#each files.accepted as item}
        <tr>
          <td><p class="subtitle is-8">{item.name}</p></td>
          <td><p class="subtitle is-8">{prettyBytes(item.size)}</p></td>
          <td><time datetime="2016-1-1">{new Date(item.lastModified)}</time></td>
        </tr>
      {/each}
    </table>
  {/if}
</div>

<style lang="scss">
</style>
