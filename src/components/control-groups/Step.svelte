<script>
  import { getContext } from 'svelte'
  import { ErrorMessages, StatusTypes } from '$lib/constants'
  import { bannerMessages } from '$stores'

  export let num

  const getWizardContext = () => {
    const context = getContext('Wizard')
    if (!context) {
      const bannerErrorMessage = {
        type: StatusTypes.DANGER,
        title: 'Error',
        message: ErrorMessages.COMPONENT_NOT_RENDERED,
      }
      bannerMessages.update((data) => [...data, bannerErrorMessage])
    }
    return context
  }

  const { step, nextStep, prevStep, resetStep, setStep } = getWizardContext()
</script>

{#if $step === num}
  <slot {nextStep} {prevStep} {resetStep} {setStep} />
{/if}
