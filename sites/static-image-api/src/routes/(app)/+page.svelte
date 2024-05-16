<script lang="ts">
	import { goto } from '$app/navigation';
	let examples = [
		'https://unpkg.com/@undp-data/style@latest/dist/style.json',
		'https://unpkg.com/@undp-data/style@latest/dist/aerialstyle.json',
		'https://narwassco.github.io/mapbox-stylefiles/unvt/style.json',
		'https://narwassco.github.io/mapbox-stylefiles/unvt/style-aerial.json'
	];

	let styleUrl = '';

	const handleClickLoad = () => {
		goto(`/playground?url=${styleUrl}`);
	};
</script>

<div class="p-4">
	<div class="field m-1">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Style URL</label>
		<div class="control">
			<div class="is-flex">
				<input class="input" bind:value={styleUrl} placeholder="paste your own style URL" />
				<button class="button is-link ml-1" on:click={handleClickLoad}>Load</button>
			</div>
		</div>
	</div>

	<hr />

	<h3 class="title is-3">Examples</h3>

	<p class="is-size-5">Select an example from the below links.</p>

	<div class="is-flex is-flex-direction-column">
		{#each examples as example}
			<a href="/playground?url={example}">{example}</a>
		{/each}
	</div>
</div>
