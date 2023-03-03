<script>
  import { getContext } from 'svelte'
  import { toast } from '@zerodevx/svelte-toast'

  export let num

  const getWizardContext = () => {
    const context = getContext('Wizard')
    if (!context) {
      toast.push('Step Component cannot be rendered outside the Wizard component')
    }
    return context
  }

  const { step, nextStep, prevStep, resetStep, setStep } = getWizardContext()
</script>

{#if $step === num}
  <slot
    {nextStep}
    {prevStep}
    {resetStep}
    {setStep} />
{/if}
