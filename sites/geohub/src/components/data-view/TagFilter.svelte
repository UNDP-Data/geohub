<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import Notification from '$components/util/Notification.svelte';
	import { SearchDebounceTime, TagSearchKeys } from '$lib/config/AppConfig';
	import { getBulmaTagColor, getSelectedTagsFromUrl, handleEnterKey } from '$lib/helper';
	import type { Tag } from '$lib/types/Tag';
	import { Button, Checkbox, Loader, Radios, type Radio } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import { TreeBranch, TreeLeaf, TreeView } from 'svelte-tree-view-component';
	import SelectedTags from './SelectedTags.svelte';

	const dispatch = createEventDispatcher();

	export let isShow = false;
	let tags: { [key: string]: Tag[] } = $page.data.tags;
	let filteredTags: { [key: string]: Tag[] } = {};
	let selectedTags: Tag[] = getSelectedTagsFromUrl($page.url);
	let operatorType: 'and' | 'or' =
		($page.url.searchParams.get('operator') as 'and' | 'or') ?? $page.url.pathname === '/map'
			? $page.data.config.TagSearchOperator
			: $page.data.config.DataPageTagSearchOperator;
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
	export let query = '';
	$: isQueryEmpty = !query || query?.length === 0;

	$: if (isShow === true) {
		// reload tags if tag panel is opened
		updateTags();
	}

	const updateTags = () => {
		tags = $page.data.tags;
		filteredTags = getFilteredTag();
		selectedTags = [...getSelectedTagsFromUrl($page.url)];
		handleFilterInput();
	};

	const fireChangeEvent = async (url: URL) => {
		tags = undefined;
		history.replaceState({}, null, url.toString());
		invalidate('data:tags').then(() => {
			tags = $page.data.tags;
			selectedTags = getSelectedTagsFromUrl($page.url);
			filteredTags = getFilteredTag();
		});

		dispatch('change', {
			tags: selectedTags
		});
	};

	const handleOperatorChanged = () => {
		if (!$page) return;
		const apiUrl = $page.url;
		apiUrl.searchParams.delete('operator');
		apiUrl.searchParams.set('operator', operatorType);
		fireChangeEvent(apiUrl);
	};

	const handleTagChecked = async (value: Tag) => {
		const tag = selectedTags?.find((t) => t.key === value.key && t.value === value.value);

		let apiUrl = $page.url;
		if (tag) {
			selectedTags.splice(selectedTags.indexOf(tag), 1);
			selectedTags = [...selectedTags];

			const values = apiUrl.searchParams.getAll(value.key);
			apiUrl.searchParams.delete(value.key);
			values
				.filter((v) => v !== value.value)
				?.forEach((v) => {
					apiUrl.searchParams.append(value.key, v);
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
			apiUrl.searchParams.append(value.key, value.value);
		}
		fireChangeEvent(apiUrl);
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

	const clearAllTags = () => {
		const apiUrl = $page.url;
		TagSearchKeys.forEach((key) => {
			apiUrl.searchParams.delete(key.key);
		});
		fireChangeEvent(apiUrl);
		selectedTags = [];
		clearInput();
	};

	const getTagSearchKey = (key: string) => {
		return TagSearchKeys?.find((t) => t.key === key);
	};

	const handleSelectedTagChanged = (e) => {
		if (e.detail.tags.length === 0) {
			clearAllTags();
		} else {
			const apiUrl = $page.url;
			fireChangeEvent(apiUrl);
		}
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

	const clearInput = () => {
		query = '';
		handleFilterInput();
	};
</script>

<div class="control has-icons-left filter-text-box my-2">
	<input
		data-testid="filter-bucket-input"
		class="input"
		type="text"
		placeholder="Type keyword to search tags"
		on:input={handleFilterInput}
		bind:value={query}
	/>
	<span class="icon is-small is-left">
		<i class="fas fa-search" />
	</span>
	{#if !isQueryEmpty}
		<span
			class="clear-button"
			role="button"
			tabindex="0"
			on:click={clearInput}
			on:keydown={handleEnterKey}
		>
			<i class="fas fa-xmark sm" />
		</span>
	{/if}
</div>

{#key selectedTags}
	<SelectedTags on:change={handleSelectedTagChanged} isClearButtonShown={true} />
{/key}

<div class="box p-0 m-0 px-4 my-2">
	<TreeView
		lineColor="#ff0000"
		iconBackgroundColor="#ff0000"
		iconColor="#FFFFFF"
		branchHoverColor="#ff0000"
	>
		{#if !tags}
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
										<Checkbox
											label="{tag.value} ({tag.count})"
											checked={existTag(tag)}
											on:clicked={() => {
												handleTagChecked(tag);
											}}
										/>
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

{#if selectedTags?.length > 0}
	<Button title="Clear all tags" on:clicked={clearAllTags} />
{/if}

<style lang="scss">
	.filter-text-box {
		display: flex;
		position: relative;
		height: 35px;
		width: 100%;

		.clear-button {
			position: absolute;
			top: 6px;
			right: 8px;
			cursor: pointer;
		}
	}

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
</style>
