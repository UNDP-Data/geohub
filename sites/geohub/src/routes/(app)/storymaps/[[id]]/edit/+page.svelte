<script lang="ts">
	import { page } from '$app/stores';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';

	import { AccessLevel } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { StoryMapConfig } from '$lib/types';
	import type { PageData } from './$types';

	export let data: PageData;

	let storymap: StoryMapConfig = data.storymap;

	const getTitle = () => {
		return storymap ? storymap.title : 'new storymap';
	};

	const getAccessIcon = () => {
		return storymap
			? storymap.access_level < AccessLevel.PUBLIC
				? getAccessLevelIcon(storymap.access_level)
				: ''
			: '';
	};

	let title = getTitle();
	let accessIcon = getAccessIcon();

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'storymaps', url: '/storymaps' },
		{ title: getTitle(), url: $page.url.href }
	];
</script>

<HeroHeader bind:title bind:icon={accessIcon} bind:breadcrumbs />

<div class="mx-6 my-4">
	<p>Coming soon!</p>
</div>
