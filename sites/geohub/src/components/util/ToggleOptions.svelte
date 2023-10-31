<script lang="ts">
	import type { ToggleOption } from '$lib/types';

	export let options: ToggleOption[];
	export let selectedValue: string | string[] | number | number[];
</script>

<p class="buttons">
	{#key selectedValue}
		{#each options as option}
			<p class="control">
				<button
					class="button is-small {`${
						JSON.stringify(option.value) == JSON.stringify(selectedValue)
							? 'is-primary is-active'
							: 'is-primary is-light'
					}`}"
					on:click={() => {
						selectedValue = JSON.parse(JSON.stringify(option.value));
					}}
				>
					<span>{option.title}</span>
				</button>
			</p>
		{/each}
	{/key}
</p>
