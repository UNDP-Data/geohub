<script lang="ts">
	import { page } from '$app/stores';
	import { SearchDebounceTime, TagSearchKeys } from '$lib/config/AppConfig';
	import { getBulmaTagColor, getSelectedTagsFromUrl } from '$lib/helper';
	import type { Tag } from '$lib/types/Tag';
	import { Notification, initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { Loader, Radios, SearchExpand, type Radio } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher, onMount } from 'svelte';
	import { TreeBranch, TreeLeaf, TreeView } from 'svelte-tree-view-component';
	import { writable } from 'svelte/store';

	const dispatch = createEventDispatcher();
	const tippyTooltip = initTooltipTippy();

	export let isShow = writable(false);

	let tags: { [key: string]: Tag[] } = {};
	let filteredTags: { [key: string]: Tag[] } = {};

	let initialUrl = $page.url;
	let currentUrl = new URL(initialUrl.href);
	let selectedTags: Tag[] = getSelectedTagsFromUrl(initialUrl);
	let operatorType: 'and' | 'or' =
		($page.url.searchParams.get('operator') as 'and' | 'or') ??
		$page.data.config.DataPageTagSearchOperator;
	let operatorTypes: Radio[] = [
		{
			label: 'Match all selected tags',
			value: 'and'
		},
		{
			label: 'Match at least a tag selected',
			value: 'or'
		}
	];
	let query = '';

	let isLoading = false;

	onMount(() => {
		isShow.subscribe((show) => {
			if (show === true) {
				// reload tags if tag panel is opened
				updateTags();
			} else {
				TagSearchKeys.forEach((key) => {
					currentUrl.searchParams.delete(key.key);
				});
				selectedTags = [];
				query = '';
				currentUrl = new URL(initialUrl);
				filteredTags = getFilteredTag();
			}
		});
	});

	const updateTags = async () => {
		tags = await getTags(currentUrl);
		filteredTags = getFilteredTag();
		selectedTags = [...getSelectedTagsFromUrl(currentUrl)];
		handleFilterInput();
	};

	const fireChangeEvent = async (url: URL) => {
		initialUrl = new URL(url);
		dispatch('change', {
			url: url
		});
	};

	const handleOperatorChanged = async () => {
		currentUrl.searchParams.delete('operator');
		currentUrl.searchParams.set('operator', operatorType);
		currentUrl = new URL(currentUrl);
		tags = await getTags(currentUrl);
		filteredTags = getFilteredTag();
	};

	const handleTagChecked = async (value: Tag) => {
		const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value);

		if (tag) {
			selectedTags.splice(selectedTags.indexOf(tag), 1);
			selectedTags = [...selectedTags];

			const values = currentUrl.searchParams.getAll(value.key);
			currentUrl.searchParams.delete(value.key);
			values
				.filter((v) => v !== value.value)
				?.forEach((v) => {
					currentUrl.searchParams.append(value.key, v);
				});
		} else {
			if (!value.color) {
				value.color = getBulmaTagColor();
			}
			if (selectedTags) {
				selectedTags = [...selectedTags, value];
			} else {
				selectedTags = [value];
			}
			currentUrl.searchParams.append(value.key, value.value);
		}
		currentUrl = new URL(currentUrl);
		tags = await getTags(currentUrl);
		filteredTags = getFilteredTag();
	};

	const existTag = (value: Tag) => {
		const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value);
		if (tag) {
			return true;
		} else {
			return false;
		}
	};

	const checkChildrenTicked = (key: string) => {
		const tags = selectedTags?.filter((t) => t.key === key);
		return !(tags && tags.length > 0);
	};

	const handleApplied = () => {
		fireChangeEvent(currentUrl);
	};

	const clearAllTags = () => {
		TagSearchKeys.forEach((key) => {
			currentUrl.searchParams.delete(key.key);
		});
		selectedTags = [];
		query = '';
		filteredTags = getFilteredTag();
		fireChangeEvent(currentUrl);
	};

	const getTagSearchKey = (key: string) => {
		return TagSearchKeys?.find((t) => t.key === key);
	};

	const handleTagDeleted = async (value: Tag) => {
		const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value);
		if (tag) {
			selectedTags.splice(selectedTags.indexOf(tag), 1);
			selectedTags = [...selectedTags];
		}

		TagSearchKeys.forEach((key) => {
			currentUrl.searchParams.delete(key.key);
		});
		selectedTags?.forEach((t) => {
			currentUrl.searchParams.append(t.key, t.value);
		});

		currentUrl = new URL(currentUrl);
		tags = await getTags(currentUrl);
	};

	const handleFilterInput = debounce(() => {
		filteredTags = getFilteredTag();
	}, SearchDebounceTime);

	const getFilteredTag = () => {
		let filtered: { [key: string]: Tag[] } = {};
		if (query === '') {
			filtered = tags;
		} else {
			filtered = {};
			Object.keys(tags).forEach((key) => {
				const res = tags[key].filter(
					(t) => t.value.toLowerCase().indexOf(query.trim().toLowerCase()) !== -1
				);
				if (res.length === 0) return;
				filtered[key] = res;
			});
		}
		return filtered;
	};

	const getTags = async (url: URL) => {
		try {
			isLoading = true;

			const apiUrl = `/api/tags?url=${encodeURIComponent(url.toString())}`;
			const res = await fetch(apiUrl);
			const json: { [key: string]: Tag[] } = await res.json();

			const tags: { [key: string]: Tag[] } = {};
			TagSearchKeys.forEach((t) => {
				if (!json[t.key]) return;
				tags[t.key] = json[t.key];
			});
			return tags;
		} finally {
			isLoading = false;
		}
	};
</script>

<div class="mb-2">
	<SearchExpand
		bind:value={query}
		open={true}
		placeholder="Type keyword to search tags"
		on:change={handleFilterInput}
		iconSize={20}
		fontSize={6}
		timeout={SearchDebounceTime}
		disabled={isLoading}
		loading={isLoading}
	/>
</div>

{#if selectedTags.length > 0}
	<div class="tags m-0 mb-2">
		{#key selectedTags}
			{#each selectedTags as tag}
				<div class="tags has-addons m-0">
					<div class="tag {tag.color}">{tag.value}</div>
					<button class="tag is-delete" on:click={() => handleTagDeleted(tag)} disabled={isLoading}
					></button>
				</div>
			{/each}
		{/key}
	</div>
{/if}

<div class="box p-0 m-0 px-4 my-2">
	<TreeView
		lineColor="#ff0000"
		iconBackgroundColor="#ff0000"
		iconColor="#FFFFFF"
		branchHoverColor="#ff0000"
	>
		{#if isLoading}
			<div class="loader-container">
				<Loader size="small" />
			</div>
		{:else if Object.keys(filteredTags).length > 0}
			{#key selectedTags}
				{#if TagSearchKeys}
					{#each Object.keys(filteredTags) as key}
						<TreeBranch
							rootContent={getTagSearchKey(key).label}
							defaultClosed={checkChildrenTicked(key)}
						>
							{#if filteredTags[key]}
								{#each filteredTags[key] as tag}
									<TreeLeaf>
										<label class="checkbox tree-check">
											<input
												type="checkbox"
												checked={existTag(tag)}
												on:change={() => handleTagChecked(tag)}
											/>
											{tag.value} ({tag.count})
										</label>
									</TreeLeaf>
								{/each}
							{/if}
						</TreeBranch>
					{/each}
				{/if}
			{/key}
		{:else}
			<Notification type="info" showCloseButton={false}>No tag found</Notification>
		{/if}
	</TreeView>
</div>

<div class="container pb-2">
	<Radios
		bind:radios={operatorTypes}
		bind:value={operatorType}
		on:change={handleOperatorChanged}
		groupName="operator"
		isVertical={true}
	/>
</div>

<div class="fixed-grid has-2-cols">
	<div class="grid">
		<div class="cell">
			<button
				class="button is-primary has-text-weight-bold is-uppercase is-fullwidth"
				on:click={handleApplied}
				disabled={currentUrl?.search === initialUrl?.search}
				use:tippyTooltip={{ content: 'Apply filter to data table' }}
			>
				Apply
			</button>
		</div>
		<div class="cell">
			<button
				class="button is-link has-text-weight-bold is-uppercase is-fullwidth"
				on:click={clearAllTags}
				disabled={selectedTags?.length === 0}
				use:tippyTooltip={{ content: 'Clear all tags' }}
			>
				Clear all
			</button>
		</div>
	</div>
</div>

<style lang="scss">
	.box {
		position: relative;
		height: 200px;
		overflow-y: auto;
		border: 1px solid gray;

		.loader-container {
			width: max-content;
			margin: auto;
		}
	}

	.tree-check {
		input[type='checkbox'] {
			-moz-appearance: none;
			-webkit-appearance: none;
			-o-appearance: none;
			outline: none;
			content: none;
		}

		input[type='checkbox']:before {
			font-family: 'FontAwesome';
			content: '\f00c';
			font-size: 12px;
			color: transparent !important;
			display: block;
			width: 12px;
			height: 12px;
			border: 2px solid #d12800;
		}

		input[type='checkbox']:checked:before {
			color: #d12800 !important;
		}
	}
</style>
