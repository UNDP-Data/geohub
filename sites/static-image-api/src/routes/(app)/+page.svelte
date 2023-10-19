<script lang="ts">
	let examples = [
		'https://unpkg.com/@undp-data/style@latest/dist/style.json',
		'https://unpkg.com/@undp-data/style@latest/dist/aerialstyle.json',
		'https://narwassco.github.io/mapbox-stylefiles/unvt/style.json',
		'https://narwassco.github.io/mapbox-stylefiles/unvt/style-aerial.json'
	];
</script>

<p class="title is-3">Examples</p>

<div class="is-flex is-flex-direction-column">
	{#each examples as example}
		<a href="/playground?url={example}">{example}</a>
	{/each}
</div>
