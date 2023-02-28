<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto, afterNavigate } from '$app/navigation'
  import { base } from '$app/paths'
  import { BlockBlobClient } from '@azure/storage-blob'
  import { filesize } from 'filesize'
  import Dropzone from 'svelte-file-dropzone'

  import Notification from '$components/controls/Notification.svelte'
  import { AccepedExtensions } from '$lib/constants'

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

  let blobUrl = ''
  let errorMessage = ''

  const uploadFile = async (sasUrl: string) => {
    if (!selectedFile) {
      return
    }
    uploadedLength = 0
    const blockBlobClient = new BlockBlobClient(sasUrl)
    const promises = []
    promises.push(blockBlobClient.uploadData(selectedFile, { onProgress: onProgress }))
    await Promise.all(promises)

    const blobUrl = await completeUploading()

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
      blobUrl: blobUrl,
    }
  }

  const completeUploading = async () => {
    const formData = new FormData()
    formData.append('blobUrl', blobUrl)
    const res = await fetch('/data/upload?/completingUpload', {
      method: 'POST',
      body: formData,
    })
    const json = await res.json()
    if (json.status !== 200) {
      throw new Error('Failed to complete uploading')
    }
    const data = JSON.parse(JSON.parse(json.data)[0])
    return data.blobUrl
  }

  const onProgress = (e) => {
    uploadedLength = e.loadedBytes
  }

  const handleFilesSelect = (e) => {
    errorMessage = ''
    selectedFile = undefined
    const { acceptedFiles } = e.detail
    if (acceptedFiles.length > 1) {
      errorMessage = 'Please select only a file. Make zip file if they are multiple files,'
      return
    }
    const file = acceptedFiles[0]
    const names = file.path.split('.')
    if (names.length < 2) {
      errorMessage = 'Please choose a supported file.'
      return
    }
    const extension: string = names[1].toLowerCase().trim()
    const formats = AccepedExtensions.filter((ext) => ext.extensions.includes(extension))
    if (formats.length === 0) {
      errorMessage = `The file extension '${extension}' is not supported.`
      return
    }
    selectedFile = file
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
      blobUrl = result.data.blobUrl
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
    <p class="subtitle is-6 m-0 pb-2">Select a geospatial file to upload to GeoHub.</p>

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
    {#if errorMessage}
      <p class="help is-danger">{errorMessage}</p>
    {/if}
    <p class="help is-link pb-2">
      The following file formats are supported in GeoHub. Click a file format name to learn more about the format.
    </p>
    <ul>
      {#each AccepedExtensions as ext}
        <li>
          <a
            href={ext.href}
            target="_blank"
            rel="noreferrer"
            ><p class="subtitle is-6 has-text-link pt-1">
              {ext.name} ({ext.extensions.map((e) => `.${e}`).join(', ')})
            </p></a>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style lang="scss">
  .description {
    height: 210px;
  }
</style>
