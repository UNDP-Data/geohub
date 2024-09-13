<script lang="ts">
	import { StoryMapFooter, type StoryMapTemplate } from '@undp-data/svelte-maplibre-storymap';

	export let width = '100%';

	let template_id: StoryMapTemplate;
</script>

<div class="footer-overlay is-flex is-align-items-center" style="width: {width};">
	<StoryMapFooter bind:template={template_id} />
</div>

<style lang="scss">
	.footer-overlay {
		position: fixed;
		bottom: 0;
		:global(.footer) {
			max-height: 80vh;
			overflow-y: auto;
		}
	}
</style>
