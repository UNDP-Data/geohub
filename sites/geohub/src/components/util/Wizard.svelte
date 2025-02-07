<script lang="ts">
	import { setContext } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	interface Props {
		initialStep?: number;
		step?: Writable<number>;
		nextStep?: () => void;
		children?: import('svelte').Snippet;
	}

	let {
		initialStep = $bindable(1),
		step = $bindable(writable(initialStep)),
		nextStep = () => {
			$step += 1;
		},
		children
	}: Props = $props();

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
	{@render children?.({ nextStep, prevStep, resetStep, setStep })}
</div>
