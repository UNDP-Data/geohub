<script lang="ts">
	export let legendType: 'default' | 'classify' = 'default';
	const handleLegendTypeChange = () => {
		legendType = legendType === 'default' ? 'classify' : 'default';
	};
</script>

<div class="centered pb-2" data-testid="legend-type-switcher-container">
	<div class="field has-addons">
		<p class="control">
			<button
				data-testid="legend-type-switcher-default"
				class="button is-normal {`${
					legendType === 'default' ? 'is-primary is-active' : 'is-primary is-light'
				}`}"
				on:click={handleLegendTypeChange}
			>
				<span>
					<i class="fa-solid fa-minus" />
					Default
				</span>
			</button>
		</p>
		<p class="control">
			<button
				data-testid="legend-type-switcher-classify"
				class="button is-normal {`${
					legendType === 'classify' ? 'is-primary is-active' : 'is-primary is-light'
				}`}"
				on:click={handleLegendTypeChange}
			>
				<span>
					<i class="fa-solid fa-list" />
					Classify
				</span>
			</button>
		</p>
	</div>
</div>

<style lang="scss">
	:global(.centered) {
		width: max-content;
		margin: auto !important;
	}
</style>
