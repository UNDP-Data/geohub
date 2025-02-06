<script lang="ts">
	import { electricityDataTypes } from '../stores/electricityDataType';

	interface Props {
		electricityDataType: number[];
	}

	let { electricityDataType = $bindable() }: Props = $props();
</script>

<div>
	<div class="button-container mt-2">
		{#each electricityDataTypes as choice}
			<button
				class="button data-option pl-3 {`${JSON.stringify(choice.value) === JSON.stringify(electricityDataType) ? 'is-active' : ''}`}"
				onclick={() => {
					electricityDataType = choice.value as number[];
				}}
			>
				<span class="is-size-7">{choice.title}</span>
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	.button-container {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: flex-start;

		button {
			&.data-option {
				justify-content: flex-start;
				background-color: #fff;
				&.is-active {
					background-color: #edf5fd;
				}
			}
		}
	}
</style>
