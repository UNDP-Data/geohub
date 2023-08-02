<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	export let initialStep = 1;

	export let step = writable(initialStep);

	export let nextStep = () => {
		$step += 1;
	};

	const prevStep = () => {
		if ($step > 0) {
			$step -= 1;
		}
	};

	const resetStep = () => {
		step.set(initialStep);
	};

	const setStep = (newStep) => {
		step.set(newStep);
	};

	setContext('Wizard', {
		step,
		nextStep,
		prevStep,
		resetStep,
		setStep
	});
</script>

<div data-testid="slotted-content">
	<slot {nextStep} {prevStep} {resetStep} {setStep} />
</div>
