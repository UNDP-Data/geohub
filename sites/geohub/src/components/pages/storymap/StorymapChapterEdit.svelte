<script lang="ts">
	import type { StoryMapChapter } from '$lib/types';
	import {
		Accordion,
		FloatingPanel,
		Help,
		Tabs,
		type Tab
	} from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let chapter: StoryMapChapter;
	export let width = 360;

	let tabs: Tab[] = [
		{ label: 'content', id: 'content' },
		{ label: 'map', id: 'map' }
	];
	let activeTab = tabs[0].id;

	const handleChange = () => {
		dispatch('change');
	};

	const handleClose = () => {
		dispatch('close');
	};

	let expanded: { [key: string]: boolean } = {};
	// to allow only an accordion to be expanded
	let expandedId: string;
	$: {
		let expandedIds = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedId
		);
		if (expandedIds.length > 0) {
			expandedId = expandedIds[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedIds[0]] = true;
		}
	}
</script>

<div style="width: {width}px;">
	<FloatingPanel title="slide settings" showExpand={false} on:close={handleClose}>
		<Tabs
			bind:tabs
			bind:activeTab
			fontWeight="semibold"
			isCapitalized={true}
			isCentered={true}
			isBoxed={false}
			isUppercase={false}
		/>

		<div class="px-2 pb-4">
			{#if chapter}
				<div hidden={activeTab !== 'content'}>
					<Accordion title="Title" bind:isExpanded={expanded['title']}>
						<div slot="content">
							<input class="input" type="text" bind:value={chapter.title} />
						</div>
						<div slot="buttons">
							<Help>the title of the slide</Help>
						</div>
					</Accordion>
					<Accordion title="Description" bind:isExpanded={expanded['description']}>
						<div slot="content">
							<textarea class="textarea" rows="6" bind:value={chapter.description}></textarea>
						</div>
						<div slot="buttons">
							<Help
								>Main description of the slide. You can write description in markdown format.</Help
							>
						</div>
					</Accordion>
					<Accordion title="Image" bind:isExpanded={expanded['image']}>
						<div slot="content">coming soon</div>
						<div slot="buttons">
							<Help>Upload an image for the slide</Help>
						</div>
					</Accordion>
					<Accordion title="Hidden" bind:isExpanded={expanded['hidden']}>
						<div slot="content">
							<input
								id="hide-slide"
								type="checkbox"
								class="switch"
								bind:checked={chapter.hidden}
								on:change={handleChange}
							/>
							<label class="pb-1" for="hide-slide">Hide this slide</label>
						</div>
						<div slot="buttons">
							<Help>You can hide the slide temporally if it is enabled</Help>
						</div>
					</Accordion>
				</div>
				<div hidden={activeTab !== 'map'}>map</div>
			{/if}
		</div>
	</FloatingPanel>
</div>

<style lang="scss">
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
</style>
