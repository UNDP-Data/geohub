<script lang="ts">
	import type { StatsCard } from '$lib/interfaces';

	interface Props {
		card: StatsCard;
		size?: 'small' | 'medium' | 'large' | 'x-large';
		accent?: 'global' | 'yellow' | 'red' | 'green' | 'blue';
	}

	let { card = $bindable(), size = 'medium', accent = 'global' }: Props = $props();
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
