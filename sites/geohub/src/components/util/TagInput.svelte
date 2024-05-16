<script lang="ts">
	import { TagInputValues } from '$lib/config/AppConfig';
	import type { Tag } from '$lib/types/Tag';
	import { Notification, handleEnterKey, initTippy } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { createEventDispatcher } from 'svelte';
	import { hideAll } from 'tippy.js';

	const dispatch = createEventDispatcher();

	let tagList: Tag[];

	const tippy = initTippy({
		theme: 'transparent',
		arrow: false,
		placement: 'left-end',
		onTrigger: async () => {
			tagList = await getTags();
			filterTagList = tagList;
		}
	});
	let tooltipContent: HTMLElement;

	let nodeRef: HTMLDivElement;
	export let tag: Tag = {
		key: '',
		value: ''
	};
	export let hiddenSelect = false;
	export let isAdd = false;
	export let isDelete = true;
	let query = '';
	let filterTagList: Tag[] = [];

	const handleDeleted = () => {
		dispatch('deleted', {
			tag
		});
		nodeRef.parentNode.removeChild(nodeRef);
	};

	const handleAdded = () => {
		dispatch('added', {
			tag
		});
	};

	const getTags = async () => {
		if (!tag.key) {
			return [];
		}
		const res = await fetch(`/api/tags?key=${tag.key}`);
		const json = await res.json();
		let tags: Tag[] = [];
		if (json[tag.key]) {
			tags = json[tag.key];
		}
		return tags;
	};

	$: query, handleSearch();
	const handleSearch = debounce(() => {
		if (query.length === 0) {
			filterTagList = tagList;
		} else {
			filterTagList = tagList.filter(
				(t) => t.value.toLowerCase().indexOf(query.toLowerCase()) !== -1
			);
		}
	}, 300);

	const handleTagClicked = (value: string) => {
		tag.value = value;
		hideAll();
	};
</script>

<div class="is-flex is-flex-direction-row py-1 px-0" bind:this={nodeRef}>
	{#if !hiddenSelect}
		<div class="select {tag.key ? 'is-success' : 'is-danger'} pr-1 is-fullwidth tag-key">
			<select bind:value={tag.key}>
				<option value="">Select a key</option>
				{#each TagInputValues as key}
					<option value={key.key}>{key.label}</option>
				{/each}
			</select>
		</div>
	{/if}
	<div class="pr-1 tag-value {hiddenSelect ? 'fullwidth' : ''}">
		<input
			class="input {tag.value ? 'is-success' : 'is-danger'}"
			type="text"
			placeholder="type word for tag"
			bind:value={tag.value}
		/>
	</div>
	<div class="pr-1">
		<button
			type="button"
			class="button"
			use:tippy={{ content: tooltipContent }}
			disabled={tag.key ? false : true}
		>
			<span class="icon is-small">
				<i class="fa-solid fa-magnifying-glass" />
			</span>
		</button>
		{#if tag.key}
			<nav class="panel tooltip" bind:this={tooltipContent}>
				<p class="panel-heading">
					{TagInputValues.find((t) => t.key === tag.key)?.label ?? tag.key}
				</p>
				<div class="panel-block">
					<p class="control has-icons-left">
						<input class="input" type="text" placeholder="Search" bind:value={query} />
						<span class="icon is-left">
							<i class="fas fa-search" aria-hidden="true" />
						</span>
						{#if query.length > 0}
							<span
								class="clear-button"
								role="button"
								tabindex="0"
								on:click={() => (query = '')}
								on:keydown={handleEnterKey}
							>
								<i class="fas fa-xmark sm" />
							</span>
						{/if}
					</p>
				</div>
				<div class="tag-list">
					{#if filterTagList?.length > 0}
						{#each filterTagList as t}
							<!-- svelte-ignore a11y-missing-attribute -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<a
								class="panel-block"
								on:click={() => {
									handleTagClicked(t.value);
								}}
								on:keydown={handleEnterKey}
							>
								<span class="panel-icon">
									<i class="fa-solid fa-tag" aria-hidden="true" />
								</span>
								{t.value} ({t.count})
							</a>
						{/each}
					{:else}
						<div class="p-2">
							<Notification type="info" showCloseButton={false}>
								No tag found. Try another keyword.
							</Notification>
						</div>
					{/if}
				</div>
			</nav>
		{/if}
	</div>
	{#if isAdd}
		<div>
			<button
				type="button"
				class="button"
				disabled={tag.key && tag.value ? false : true}
				on:click={handleAdded}
			>
				<span class="icon is-small">
					<i class="fa-solid fa-plus" />
				</span>
			</button>
		</div>
	{:else if isDelete === true}
		<div>
			<button
				type="button"
				class="button"
				disabled={tag.key && tag.value ? false : true}
				on:click={handleDeleted}
			>
				<span class="icon is-small">
					<i class="fa-solid fa-trash-can" />
				</span>
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	@import 'tippy.js/dist/tippy.css';
	@import 'tippy.js/themes/light.css';

	.tag-key {
		width: 200px;
	}
	.tag-value {
		width: 70%;

		&.fullwidth {
			width: 100%;
		}
	}

	.tooltip {
		.clear-button {
			position: absolute;
			top: 0.6rem;
			right: 0.8rem;
			cursor: pointer;
			color: gray;
		}

		.tag-list {
			max-height: 250px;
			overflow-y: auto;
		}
	}

	:global(.tippy-content) {
		padding: 0;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: white;
		color: transparent;
	}
</style>
