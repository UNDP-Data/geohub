<!-- https://design.undp.org/?path=/docs/components-ui-components-cards-content-card-without-image-without-emphasize--docs -->
<script lang="ts">
	export let linkName = 'READ MORE';
	export let url = '#';
	export let tag: string;
	export let title: string;
	export let description: string;

	export let isEmphasize = false;
	export let accent: 'global' | 'yellow' | 'red' | 'green' | 'blue' = 'global';

	let descriptionLength = 100;
</script>

<div
	class="content-card card {isEmphasize ? 'card-emphasize' : ''} {accent === 'global'
		? ''
		: `accent-${accent}`}"
>
	<a href={url}>
		<h6 class="" data-viewport="false">{tag}</h6>
		<div class="content-caption">
			<h5 class="" data-viewport="false">
				{title}
			</h5>
			<p>
				{#if description?.length > descriptionLength}
					{description.substring(0, descriptionLength)}...
				{:else}
					{description}
				{/if}
			</p>
			<span class="cta__link cta--space">
				{linkName}
				<i></i>
			</span>
		</div>
	</a>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/cta-link.min.css';
	@use '../css/content-card.min.css';
	@use '../css/buttons.min.css';
</style>
