<script lang="ts">
	import { VectorFilterOperators } from '$lib/config/AppConfig';
	import { handleEnterKey } from '@undp-data/svelte-undp-components';

	interface Props {
		currentSelectedOperation?: string;
		stringProperty?: boolean;
		numberProperty?: boolean;
		onchange?: (operation: string) => void;
		ondisableTags?: () => void;
		onenableTags?: () => void;
		onclick?: () => void;
	}

	let {
		currentSelectedOperation = $bindable(''),
		stringProperty = $bindable(false),
		numberProperty = $bindable(false),
		onchange = (operation) => {
			console.log(operation);
		},
		ondisableTags = () => {},
		onenableTags = () => {},
		onclick = () => {}
	}: Props = $props();

	const operationOptions = VectorFilterOperators.filter((el) => {
		if (stringProperty && ['>', '<'].includes(el.value)) return false;
		if (numberProperty && ['in', '!in'].includes(el.value)) return false;
		return true;
	});

	const handleOperationChange = () => {
		if (currentSelectedOperation === '==' || currentSelectedOperation === '!=') {
			if (ondisableTags) {
				ondisableTags();
			}
		} else {
			if (onenableTags) {
				onenableTags();
			}
		}
		if (onchange) {
			onchange(currentSelectedOperation);
		}
	};
	$effect(() => {
		handleOperationChange();
	});
</script>

<div class="fixed-grid has-3-cols">
	<div class="grid is-gap-1">
		{#each operationOptions as operation (operation.value)}
			<div class="cell">
				<div
					data-testid="operation-button"
					class="card grid-item p-0 m-0 is-clickable {operation.disabled ? 'disabled' : null} "
					role="button"
					tabindex="0"
					onkeydown={handleEnterKey}
					onclick={() => {
						operation.disabled ? null : (currentSelectedOperation = operation.value);
						operation.disabled ? null : onclick();
					}}
				>
					<div
						class="card-header is-size-6 pb-0 pt-0 m-0 {currentSelectedOperation === operation.value
							? 'has-background-success'
							: 'has-background-info'} "
					>
						<span
							class="card-header-title is-centered is-v-centered {currentSelectedOperation ===
							operation.value
								? 'has-text-white-ter'
								: 'has-text-white-ter'}  "
						>
							{#if currentSelectedOperation === operation.value}
								<span class="icon">
									<i class="fa-solid fa-check"></i>
								</span>
							{/if}
							{operation.label}
						</span>
					</div>
					<div class="card-content is-flex is-align-items-center is-justify-content-center">
						<div class="content is-size-2 p-0 m-0 has-text-weight-bold has-text-danger">
							{operation.symbol}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.disabled {
		opacity: 0.5;
		background-color: white !important;
		cursor: not-allowed !important;
	}

	.grid-item {
		.card-header {
			height: 44px;
		}
		.card-content {
			height: 60px;
		}
	}
</style>
