<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

	export let num: number;

	// Local interface for context
	interface WizardContext {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		step: Writable<any>;
		nextStep: () => void;
		prevStep: () => void;
		resetStep: () => void;
		setStep: (step: number) => void;
	}

	const getWizardContext = () => {
		const context = getContext('Wizard');
		if (!context) {
			toast.push('Step Component cannot be rendered outside the Wizard component');
		}
		return context as WizardContext;
	};

	const { step, nextStep, prevStep, resetStep, setStep } = getWizardContext();
</script>

{#if $step === num}
	<slot {nextStep} {prevStep} {resetStep} {setStep} />
{/if}
