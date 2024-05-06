<script lang="ts">
	import { getBulmaTagColor } from '$lib/helper';
	import type { Tag } from '$lib/types';
	import { Notification, handleEnterKey, initTippy } from '@undp-data/svelte-undp-components';
	import { debounce } from 'lodash-es';
	import { hideAll } from 'tippy.js';

	const tippy = initTippy({
		arrow: false,
		theme: 'transparent'
	});
	let tooltipContent: HTMLElement;

	const TAG_KEY = 'provider';

	export let tags: Tag[] = [];
	let tagList: Tag[] = tags;
	let filterTagList: Tag[] = tags;
	let query = '';

	const getTags = async () => {
		const res = await fetch(`/api/tags?key=${TAG_KEY}`);
		const json = await res.json();
		let _tags: Tag[] = [];
		if (json[TAG_KEY]) {
			_tags = json[TAG_KEY];
		}
		tagList = [..._tags];
		filterTagList = [...tagList];
	};

	let loadingTags = getTags();

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

	const clear = () => {
		query = '';
		filterTagList = tagList;
		hideAll();
	};

	const handleTagClicked = (value: Tag) => {
		if (!tags.find((t) => t.value === value.value)) {
			value.color = getBulmaTagColor();
			tags = [...tags, value];
		}
		clear();
	};

	const handleProviderAdded = () => {
		tags = [
			...tags,
			{
				key: TAG_KEY,
				value: query.trim(),
				color: getBulmaTagColor()
			}
		];
		clear();
	};

	const handleTagDeleted = (t: Tag) => {
		const index = tags.findIndex((tag) => tag.key === t.key && tag.value === t.value);
		tags.splice(index, 1);
		tags = [...tags];
	};
</script>

<div class="provider-selected py-2">
	<div class="tags p-0 m-0">
		{#each tags as tag}
			<div class="tags has-addons p-0 m-0 mx-1">
				<div class="tag {getBulmaTagColor()}">{tag.value}</div>
				<div
					class="tag is-delete tag-delete"
					role="button"
					tabindex="0"
					on:click={() => handleTagDeleted(tag)}
					on:keydown={handleEnterKey}
				/>
			</div>
		{/each}
	</div>
</div>

<div class="country-select-button pr-2" use:tippy={{ content: tooltipContent }}>
	<div class="box p-2">
		<span class="icon is-large">
			<i class="fa-solid fa-magnifying-glass fa-2xl" />
		</span>
	</div>
</div>

<div class="tooltip p-2" data-testid="tooltip" bind:this={tooltipContent}>
	<nav class="panel tooltip" bind:this={tooltipContent}>
		<p class="panel-heading">Data providers</p>
		<div class="panel-block">
			<p class="control has-icons-left">
				<input
					class="input"
					type="text"
					placeholder="Type name to search tags"
					bind:value={query}
				/>
				<span class="icon is-left">
					<i class="fas fa-search" aria-hidden="true" />
				</span>
				{#if query.length > 0}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<span class="clear-button" role="button" tabindex="0" on:click={() => (query = '')}>
						<i class="fas fa-xmark sm" />
					</span>
				{/if}
			</p>
		</div>
		<div class="tag-list">
			{#await loadingTags then}
				{#if filterTagList?.length > 0}
					{#each filterTagList as t}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class="panel-block"
							role="menu"
							tabindex="0"
							on:click={() => {
								handleTagClicked(t);
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
							No provider found. Try another keyword or create new provider by the below button.
							<br /><br />
							<button class="button is-primary" on:click={handleProviderAdded}>Add provider</button>
						</Notification>
					</div>
				{/if}
			{/await}
		</div>
	</nav>
</div>

<style lang="scss">
	.country-select-button {
		width: fit-content;
		cursor: pointer;
	}

	.tooltip {
		max-width: 300px;

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

	.tag-delete {
		cursor: pointer;
	}

	:global(.tippy-content) {
		padding: 0;
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: white;
		color: transparent;
	}
</style>
