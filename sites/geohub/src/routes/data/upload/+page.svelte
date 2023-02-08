<script lang="ts">
  import { enhance } from '$app/forms'
  import { BlockBlobClient } from '@azure/storage-blob'
  import { filesize } from 'filesize'
  import Dropzone from 'svelte-file-dropzone'
  import Notification from '$components/controls/Notification.svelte'

  let fileInput: HTMLInputElement
  let selectedFile: File

  let uploadingFile: Promise<{ success: boolean }>
  let uploadedLength = 0
  $: progress = selectedFile ? (uploadedLength / selectedFile?.size) * 100 : 0

  let name = ''
  let description = ''
  let attribution = ''
  let license = ''

  $: {
    if (selectedFile && !name) {
      name = selectedFile.name
    }
  }

  let licenses = [
    'Open Data Commons Open Database License (ODbL)',
    'Creative Commons Zero 1.0 Universal',
    'Creative Commons BY 4.0',
    'Creative Commons BY ShareAlike 4.0',
    'Creative Commons BY NoDerivs 4.0',
    'Creative Commons BY NonCommercial 4.0',
    'Creative Commons BY NonCommercial ShareAlike 4.0',
    'Creative Commons BY NonCommercial NoDerivs 4.0',
  ]

  const uploadFile = async (sasUrl: string) => {
    if (!selectedFile) {
      return
    }
    uploadedLength = 0
    console.log(sasUrl)
    const blockBlobClient = new BlockBlobClient(sasUrl)
    const promises = []
    promises.push(blockBlobClient.uploadData(selectedFile, { onProgress: onProgress }))
    await Promise.all(promises)

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

<div class="field">
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

<div class="field">
  <label class="label">Name</label>
  <div class="control has-icons-right">
    <input
      class="input {name.length > 0 ? 'is-success' : 'is-danger'}"
      type="text"
      placeholder="Type name of dataset"
      bind:value={name} />
    {#if name}
      <span class="icon is-small is-right">
        <i class="fas fa-check has-text-success" />
      </span>
    {/if}
  </div>
  {#if !name}
    <p class="help is-danger">Name is required</p>
  {/if}
</div>

<div class="field">
  <label class="label">Description</label>
  <div class="control has-icons-right">
    <textarea
      class="textarea {description.length > 0 ? 'is-success' : 'is-danger'}"
      placeholder="Type description of dataset"
      bind:value={description} />
    {#if description}
      <span class="icon is-small is-right">
        <i class="fas fa-check has-text-success" />
      </span>
    {/if}
  </div>
  {#if !description}
    <p class="help is-danger">Description is required</p>
  {/if}
</div>

<div class="field">
  <label class="label">Attribution</label>
  <div class="control has-icons-right">
    <input
      class="input {attribution.length > 0 ? 'is-success' : 'is-danger'}"
      type="text"
      placeholder="Type attribution of dataset"
      bind:value={attribution} />
    {#if attribution}
      <span class="icon is-small is-right">
        <i class="fas fa-check has-text-success	" />
      </span>
    {/if}
  </div>
  {#if !attribution}
    <p class="help is-danger">Attribution is required</p>
  {/if}
</div>

<div class="field">
  <label class="label">License</label>
  <div class="control has-icons-right">
    <div class="select is-fullwidth {license.length > 0 ? 'is-success' : 'is-danger'}">
      <select bind:value={license}>
        <option value="">Select a data license</option>
        {#each licenses as lc}
          <option value={lc}>{lc}</option>
        {/each}
      </select>
    </div>
    {#if license}
      <span class="icon is-small is-right">
        <i class="fas fa-check has-text-success	" />
      </span>
    {/if}
  </div>
  {#if !license}
    <p class="help is-danger">license is required</p>
  {/if}
</div>

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
  {#if selectedFile}
    <input
      class="input"
      type="hidden"
      name="fileName"
      bind:value={selectedFile.name} />
  {/if}

  <div class="field is-grouped py-4">
    <div class="control">
      <button
        class="button is-primary"
        type="submit"
        disabled={!selectedFile}>Submit</button>
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
      showCloseButton={false}>Successfully uploaded the file to GeoHub!</Notification>
  {/if}
{/await}
