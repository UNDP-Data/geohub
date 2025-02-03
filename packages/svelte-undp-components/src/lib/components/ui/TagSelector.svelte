<script lang="ts" module>
	export interface Tag {
		key: string;
		value: string;
		count?: number;
	}
</script>

<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey';
	import { initTippy, initTooltipTippy } from '$lib/util/initTippy';
	import { Chips } from '@undp-data/svelte-undp-design';
	import { debounce } from 'lodash-es';
	import { onMount, untrack } from 'svelte';
	import Notification from './Notification.svelte';

	interface Props {
		selected: Tag[];
		geohubOrigin?: string;
		key?: string;
		placeholder?: string;
		apiUrl?: string;
		type?: 'single' | 'multi';
		newTagMode?: boolean;
		showSelectedTags?: boolean;
		onselect?: (tags: Tag[], key: string) => void;
	}

	let {
		selected = $bindable([]),
		geohubOrigin = '',
		key = '',
		placeholder = 'Type keyword...',
		apiUrl = $bindable(),
		type = 'multi',
		newTagMode = false,
		showSelectedTags = true,
		onselect = () => {}
	}: Props = $props();

	let query = $state('');

	let isLoading = $state(false);
	let tippy = initTippy({
		appendTo: document.body,
		maxWidth: 500,
		placement: 'bottom-start',
		trigger: 'mounseenter focus click',
		arrow: false,
		offset: [0, 0]
	});
	let tooltipContent: HTMLElement | undefined = $state();

	let tooltipTippy = initTooltipTippy();

	let tags: Tag[] = $state([]);
	let tagsFiltered: Tag[] = $state([]);

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
			`${geohubOrigin}/api/tags${apiUrl && apiUrl.length > 0 ? `?url=${encodeURIComponent(apiUrl)}` : ''}`
		);
		const json = await res.json();
		tags = json[key] ?? [];
		tagsFiltered = tags;
		isLoading = false;
		return tags;
	};

	const handleTagSelected = (tag: Tag) => {
		if (type === 'multi') {
			if (selected.includes(tag)) {
				selected = selected.filter((n) => n.value !== tag.value);
			} else {
				selected = [...selected, tag];
			}
		} else {
			if (selected.includes(tag)) {
				selected = [];
			} else {
				selected = [tag];
			}
		}

		dispatchEvent();
	};

	const handleDeleteTag = (tag: Tag) => {
		selected = selected.filter((n) => n.value !== tag.value);
		dispatchEvent();
	};

	const handleAddTag = () => {
		const newTag: Tag = {
			key: key,
			value: query.trim()
		};
		if (type === 'multi') {
			selected = [...selected, newTag];
		} else {
			selected = [newTag];
		}
		tagsFiltered = [...tags];
		query = '';
	};

	const dispatchEvent = () => {
		const filtered = tags.filter((n) => selected.includes(n));
		if (onselect) onselect(filtered, key);
	};

	$effect(() => {
		if (apiUrl) {
			untrack(() => {
				getTags();
			});
		}
	});

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
			: `${type === 'single' ? `${selected[0].value} is selected` : `${selected.length} ${selected.length === 1 ? 'tag is selected' : 'tags are selected'}`}`}
		oninput={handleInput}
		onkeydown={handleEnterKey}
		use:tippy={{ content: tooltipContent }}
	/>
	<span class="icon is-small is-left">
		<span class="material-symbols-outlined"> search </span>
	</span>
</div>

<div bind:this={tooltipContent} class="tag-tooltip">
	{#if showSelectedTags && type === 'multi' && selected.length > 0}
		<div class="selected-area fixed-grid has-3-cols p-2">
			<div class="grid">
				{#each selected as tag}
					<div class="cell">
						<Chips
							bind:label={tag.value}
							showDelete={true}
							ondelete={() => {
								handleDeleteTag(tag);
							}}
						/>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	<div class="tag-content">
		{#if tags.length === 0 && tagsFiltered.length === 0}
			<div class="p-2">
				<Notification type="info" showCloseButton={false}>No tag found</Notification>
			</div>
		{:else if tags.length > 0 && tagsFiltered.length === 0 && query.length > 0}
			<div class="p-2">
				{#if newTagMode}
					<Notification type="info" showCloseButton={false} showIcon={false}>
						<p>
							This tag <b>{query}</b> is not registred. Do you wish to add new tag?
						</p>

						<button class="button is-link mt-2" type="button" onclick={handleAddTag}>
							Create new tag
						</button>
					</Notification>
				{:else}
					<Notification type="info" showCloseButton={false}>No tag found</Notification>
				{/if}
			</div>
		{:else}
			{#each tagsFiltered as tag}
				{@const isSelected = selected.includes(tag)}
				<!-- svelte-ignore a11y_interactive_supports_focus -->
				<div
					class="tag-item p-1 {type === 'single' ? 'pl-2 pr-0' : 'px-3'}"
					role="menuitem"
					onclick={() => {
						if (type === 'multi') {
							return;
						}
						handleTagSelected(tag);
					}}
					onkeydown={handleEnterKey}
				>
					<label class="checkbox is-flex is-align-items-center">
						<span
							class="wrap-text tag-label {type === 'single' ? 'p-3 pr-0' : 'p-3'} {type ===
								'single' &&
							selected.length > 0 &&
							selected[0].value === tag.value
								? 'has-text-primary hes-text-weight-bold'
								: ''}"
							use:tooltipTippy={{ content: `${tag.value} ${tag.count ? `(${tag.count})` : ''}` }}
						>
							{tag.value}
							{#if tag.count}
								({tag.count})
							{/if}
						</span>

						{#if type === 'multi'}
							<input
								class="ml-auto"
								type="checkbox"
								checked={isSelected}
								onchange={() => {
									handleTagSelected(tag);
								}}
							/>
						{/if}
					</label>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	.tag-content {
		max-height: 300px !important;
		overflow-y: auto !important;

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
