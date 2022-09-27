<script lang="ts">
  import type { DataUploadStep, Metadata, SDG, UploadFiles } from '../interfaces'
  import FileDrop from './FileDrop.svelte'
  import SDGSelect from './SDGSelect.svelte'
  import MetadataInput from './MetadataInput.svelte'
  import DataUploadConfirm from './DataUploadConfirm.svelte'

  let steps: DataUploadStep[] = [
    {
      id: 1,
      title: 'Step 1',
      description: 'Select a file',
    },
    {
      id: 2,
      title: 'Step 2',
      description: 'Select SDG',
    },
    {
      id: 3,
      title: 'Step 3',
      description: 'Input metadata',
    },
    {
      id: 4,
      title: 'Step 4',
      description: 'Confirm',
    },
    {
      id: 5,
      title: 'Step 5',
      description: 'Submitted',
    },
  ]

  let currentStep: DataUploadStep = steps[0]
  let isNextButtonEnabled = false

  let selectedFiles: UploadFiles
  let selectedSDG: SDG
  let metadata: Metadata
  let metadataFormCompleted = false

  $: if (currentStep) {
    switch (currentStep.id) {
      case 1:
        fileSelected()
        break
      case 2:
        sdgSelected()
        break
      case 3:
        metadataFilled()
        break
      case 4:
        isNextButtonEnabled = true
        break
      default:
        isNextButtonEnabled = false
        break
    }
  }

  const handleBack = () => {
    if (currentStep.id > 1) {
      const currentId = currentStep.id
      const beforeId = currentId - 1
      currentStep = steps[beforeId - 1]
    }
  }

  const handleNext = () => {
    if (currentStep.id < 5) {
      const currentId = currentStep.id
      const nextId = currentId + 1
      currentStep = steps[nextId - 1]
    }
  }

  $: selectedFiles, fileSelected()
  const fileSelected = () => {
    if (selectedFiles && selectedFiles.accepted && selectedFiles.accepted.length > 0) {
      isNextButtonEnabled = true
    } else {
      isNextButtonEnabled = false
    }
  }

  $: selectedSDG, sdgSelected()
  const sdgSelected = () => {
    if (selectedSDG) {
      isNextButtonEnabled = true
    } else {
      isNextButtonEnabled = false
    }
  }

  $: metadataFormCompleted, metadataFilled()
  const metadataFilled = () => {
    if (metadataFormCompleted === true) {
      isNextButtonEnabled = true
    } else {
      isNextButtonEnabled = false
    }
  }
</script>

{#key currentStep}
  <div class="columns is-mobile is-vcentered">
    <div class="column m-5 is-centered">
      <ul class="steps is-medium">
        {#each steps as step}
          <li class="steps-segment {`${currentStep.id === step.id ? 'is-active' : ''}`}">
            <span class="steps-marker" />
            <div class="steps-content">
              <p class="is-size-4">{step.title}</p>
              <p>{step.description}</p>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="main-content">
    {#if currentStep.id === 1}
      <FileDrop bind:files={selectedFiles} />
    {:else if currentStep.id == 2}
      <SDGSelect bind:selectedSDG />
    {:else if currentStep.id == 3}
      <MetadataInput bind:metadata bind:metadataFormCompleted />
    {:else if currentStep.id == 4}
      <DataUploadConfirm bind:selectedFiles bind:selectedSDG bind:metadata />
    {:else if currentStep.id == 5}
      <p>not yet ready</p>
    {/if}
  </div>

  {#if currentStep.id < steps[steps.length - 1].id}
    <div class="columns m-5 is-vcentered">
      <div class="column">
        {#if currentStep.id > steps[0].id}
          <button class="button is-light" on:click={handleBack}>Back</button>
        {/if}
        {#if isNextButtonEnabled}
          <button class="button is-primary" on:click={handleNext}>{currentStep.id < 4 ? 'Next' : 'Submit'}</button>
        {/if}
      </div>
    </div>
  {/if}
{/key}

<style lang="scss">
  @import 'bulma/css/bulma.css';
  @import 'bulma-o-steps/bulma-steps.sass';

  $height: calc(100vh - 178px);

  .main-content {
    max-height: $height;
  }

  .step-select {
    cursor: pointer;
  }
</style>
