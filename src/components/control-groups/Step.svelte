<script>
  import { getContext } from 'svelte'

  export let num

  const getWizardContext = () => {
    const context = getContext('Wizard')
    if (!context) {
      throw new Error('StepWizard compound components cannot be rendered outside the StepWizard component')
    }
    return context
  }

  const { step, nextStep, prevStep, resetStep, setStep } = getWizardContext()
</script>

{#if $step === num}
  <slot {nextStep} {prevStep} {resetStep} {setStep} />
{/if}
