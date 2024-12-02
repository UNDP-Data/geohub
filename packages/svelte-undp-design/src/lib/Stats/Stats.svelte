<script lang="ts">
	import type { StatsCard } from '$lib/interfaces';

	export let card: StatsCard;
	export let size: 'small' | 'medium' | 'large' | 'x-large' = 'medium';
	export let accent: 'global' | 'yellow' | 'red' | 'green' | 'blue' = 'global';
</script>

<div class="stats-card {size} {accent === 'global' ? '' : `accent-${accent}`}">
	<div>
		<div><h2>{card.stat}</h2></div>
	</div>
	<div>
		<h4>{card.title}</h4>
		<p>{card.description}</p>
	</div>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/stats-cards.min.css';
</style>
