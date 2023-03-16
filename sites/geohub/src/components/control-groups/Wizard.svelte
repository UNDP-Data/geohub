<script lang="ts">
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  export let initialStep = 1

  let step = writable(initialStep)

  const nextStep = () => {
    $step += 1
  }

  const prevStep = () => {
    if ($step > 0) {
      $step -= 1
    }
  }

  const resetStep = () => {
    step.set(initialStep)
  }

  const setStep = (newStep) => {
    step.set(newStep)
  }

  setContext('Wizard', {
    step,
    nextStep,
    prevStep,
    resetStep,
    setStep,
  })
</script>

<slot
  {nextStep}
  {prevStep}
  {resetStep}
  {setStep} />
