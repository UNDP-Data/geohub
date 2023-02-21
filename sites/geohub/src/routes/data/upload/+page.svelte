<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto, afterNavigate } from '$app/navigation'
  import { base } from '$app/paths'
  import { BlockBlobClient } from '@azure/storage-blob'
  import { filesize } from 'filesize'
  import Dropzone from 'svelte-file-dropzone'

  import Notification from '$components/controls/Notification.svelte'

  // preserve previous page URL
  let previousPage: string = base
  afterNavigate(({ from }) => {
    if (from?.url) {
      previousPage = `${from?.url.pathname}${from?.url.search}`
    }
  })
  const REDIRECRT_TIME = 2000 // two second

  let fileInput: HTMLInputElement
  let selectedFile: File
  $: selectedFileName = selectedFile?.name

  let uploadingFile: Promise<{ success: boolean }>
  let uploadedLength = 0
  $: progress = selectedFile ? (uploadedLength / selectedFile?.size) * 100 : 0

  const uploadFile = async (sasUrl: string) => {
    if (!selectedFile) {
      return
    }
    uploadedLength = 0
    const blockBlobClient = new BlockBlobClient(sasUrl)
    const promises = []
    promises.push(blockBlobClient.uploadData(selectedFile, { onProgress: onProgress }))
    await Promise.all(promises)

    setTimeout(() => {
      let redirectPage = previousPage
      if (!previousPage) {
        redirectPage = '/data'
      }
      goto(redirectPage, {
        replaceState: true,
      })
    }, REDIRECRT_TIME)

    return {
      success: true,
    }
  }

  const onProgress = (e) => {
    uploadedLength = e.loadedBytes
  }

  const handleFilesSelect = (e) => {
    const { acceptedFiles } = e.detail
    selectedFile = acceptedFiles[0]
  }
</script>

<p class="title is-4">Upload data to GeoHub</p>

<form
  method="POST"
  action="?/getSasUrl"
  use:enhance={() => {
    return async ({ result, update }) => {
      await update()
      const sasUrl = result.data.sasUrl
      uploadingFile = uploadFile(sasUrl)
    }
  }}>
  <input
    class="input"
    type="hidden"
    name="fileName"
    bind:value={selectedFileName} />

  <div class="field is-grouped py-4">
    <div class="control">
      <button
        class="button is-primary"
        type="submit"
        disabled={!selectedFile}>
        <span class="icon">
          <i class="fa-solid fa-cloud-arrow-up" />
        </span>
        <span>Upload</span>
      </button>
    </div>
  </div>
</form>

{#await uploadingFile}
  <progress
    class="progress is-success"
    value={progress}
    max="100">{progress}%</progress>

  <p>{filesize(uploadedLength, { round: 1 })} / {filesize(selectedFile?.size, { round: 1 })}</p>
{:then result}
  {#if result?.success}
    <Notification
      type="info"
      showCloseButton={false}>Successfully uploaded the file to GeoHub! It is going back to Data page.</Notification>
  {/if}
{/await}

<div class="field">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label">Geospatial file</label>
  <div class="control">
    <p class="subtitle is-6">Select a geospatial file to upload to GeoHub.</p>

    <Dropzone
      noClick={true}
      on:drop={handleFilesSelect}>
      <p>Drag & drop a file here, or click the below button to select a file</p>
    </Dropzone>

    <div class="file has-name pt-2">
      <label class="file-label">
        <input
          class="file-input"
          type="file"
          bind:this={fileInput}
          on:change={() => {
            const files = fileInput.files
            if (!files || files.length === 0) {
              selectedFile = undefined
              return
            }
            selectedFile = files[0]
          }} />
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-upload" />
          </span>
          <span class="file-label"> Choose a file… </span>
        </span>
        {#if selectedFile}
          <span class="file-name">
            <p>{selectedFile.name} ({filesize(selectedFile?.size, { round: 1 })})</p>
          </span>
        {/if}
      </label>
    </div>
  </div>
</div>

<style lang="scss">
  .description {
    height: 210px;
  }
</style>
