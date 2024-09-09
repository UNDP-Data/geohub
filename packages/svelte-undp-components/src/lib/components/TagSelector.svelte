<script lang="ts" context="module">
	export interface Tag {
		key: string;
		value: string;
		count?: number;
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { initTippy, initTooltipTippy } from '$lib/util/initTippy.js';
	import { Chips } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher, onMount } from 'svelte';
	import Notification from './Notification.svelte';

	const dispatch = createEventDispatcher();

	export let selected: Tag[] = [];
	export let geohubOrigin = '';
	export let key = '';
	export let placeholder = 'Type keyword...';
	export let apiUrl = '';

	let query = '';

	let isLoading = false;
	let tippy = initTippy({
		appendTo: document.body,
		maxWidth: 500,
		placement: 'bottom-start',
		trigger: 'mounseenter focus click',
		arrow: false,
		offset: [0, 0]
	});
	let tooltipContent: HTMLElement;

	let tooltipTippy = initTooltipTippy();

	let tags: Tag[] = [];
	let tagsFiltered: Tag[] = [];

	const handleInput = debounce(() => {
		if (query.length > 0) {
			tagsFiltered = [
				...tags.filter((t) => (t.value as string).toLowerCase().indexOf(query.toLowerCase()) !== -1)
			];
		} else {
			tagsFiltered = [...tags];
		}
	}, 300);

	const getTags = async () => {
		isLoading = true;
		const res = await fetch(
			`${geohubOrigin}/api/tags${apiUrl.length > 0 ? `?url=${encodeURIComponent(apiUrl)}` : ''}`
		);
		const json = await res.json();
		tags = json[key] ?? [];
		tagsFiltered = tags;
		isLoading = false;
		return tags;
	};

	const handleTagSelected = (tag: Tag) => {
		if (selected.includes(tag)) {
			selected = selected.filter((n) => n.value !== tag.value);
		} else {
			selected = [...selected, tag];
		}
		dispatchEvent();
	};

	const handleDeleteTag = (tag: Tag) => {
		selected = selected.filter((n) => n.value !== tag.value);
		dispatchEvent();
	};

	const dispatchEvent = () => {
		const filtered = tags.filter((n) => selected.includes(n));
		dispatch('select', { selected: filtered, key });
	};

	$: apiUrl, getTags();

	onMount(() => {
		getTags();
	});
</script>

<div class="control has-icons-left has-icons-right {isLoading ? 'is-loading' : ''}">
	<input
		class="input"
		type="text"
		bind:value={query}
		disabled={isLoading}
		placeholder={selected.length === 0
			? placeholder
			: `${selected.length} ${selected.length === 1 ? 'tag is' : 'tags are'} selected`}
		on:input={handleInput}
		on:keydown={handleEnterKey}
		use:tippy={{ content: tooltipContent }}
	/>
	<span class="icon is-small is-left">
		<span class="material-symbols-outlined"> search </span>
	</span>
</div>

<div bind:this={tooltipContent} class="tag-tooltip">
	{#if selected.length > 0}
		<div class="selected-area fixed-grid has-3-cols my-2">
			<div class="grid">
				{#each selected as tag}
					<div class="cell">
						<Chips
							bind:label={tag.value}
							showDelete={true}
							on:delete={() => {
								handleDeleteTag(tag);
							}}
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	<div class="tag-content">
		{#if tagsFiltered.length === 0}
			<Notification type="info" showCloseButton={false}>No tag found</Notification>
		{:else}
			{#each tagsFiltered as tag}
				{@const isSelected = selected.includes(tag)}
				<div class="tag-item p-1">
					<label class="checkbox is-flex is-align-items-center">
						<span
							class="wrap-text tag-label p-3"
							use:tooltipTippy={{ content: `${tag.value} ${tag.count ? `(${tag.count})` : ''}` }}
						>
							{tag.value}
							{#if tag.count}
								({tag.count})
							{/if}
						</span>

						<input
							class="ml-auto"
							type="checkbox"
							checked={isSelected}
							on:change={() => {
								handleTagSelected(tag);
							}}
						/>
					</label>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	.tag-content {
		max-height: 300px;
		overflow-y: auto;

		.tag-item {
			border-bottom: 1px solid #d4d6d8;
			&:last-child {
				border-bottom: none;
			}

			:hover {
				background-color: #f7f7f7;
			}

			.tag-label {
				width: 80%;
			}

			input[type='checkbox'] {
				-webkit-appearance: none;
				-moz-appearance: none;
				appearance: none;
				width: 16px;
				height: 16px;
				border: 2px solid #d12800;
				border-radius: 0;

				&:checked {
					background-color: white;
					border-color: #d12800;

					&::before {
						content: '';
						display: block;
						width: 5px;
						height: 10px;
						border: solid #d12800;
						border-width: 0 2px 2px 0;
						transform: rotate(45deg);
						margin: 0px 4px;
					}
				}
			}
		}
	}

	.selected-area {
		max-height: 120px;
		overflow-y: auto;
	}

	.wrap-text {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		word-break: break-all;
	}

	.tag-tooltip {
		z-index: 10;
		min-width: 300px;
		max-width: 350px;
	}
</style>
