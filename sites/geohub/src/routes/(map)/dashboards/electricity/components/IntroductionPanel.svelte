<script lang="ts">
	import { hrea, ml } from '../stores';

	export let showIntro: boolean;
	const hideIntro = () => {
		showIntro = false;
	};

	$: disabled = !($hrea?.length > 0 && $ml?.length > 0);
</script>

{#if showIntro}
	<p class="is-size-6 mb-4">
		The 'Affordable and clean energy' dashboard helps identify vulnerable areas in the world that
		have limited or no access to energy.
	</p>
	<p class="is-size-6 mb-4">
		By comparing electricity data with wealth data, suggestions can be made regarding which areas
		are most at risk and in need of improvements in electricity infrastructure.
	</p>
	<button class="button {disabled ? 'is-loading' : ''}" on:click={hideIntro}>Start exploring</button
	>
{/if}

<style lang="scss">
	button {
		width: 200px;
		justify-content: flex-start;
		background-color: #006eb5;
		color: #fff;
	}
</style>
