<script lang="ts">
	import { handleEnterKey } from '$lib/util/handleEnterKey.js';
	import { createEventDispatcher, onMount } from 'svelte';
	import type { IconImageType } from './IconImage.svelte';
	import IconImagePickerCard from './IconImagePickerCard.svelte';
	import type { Tab } from './Tabs.svelte';
	import Tabs from './Tabs.svelte';

	export let images: IconImageType[] = [];
	export let selected: string;

	const iconGroupRanges = [
		{
			id: 'a - h',
			range: Array.from({ length: 8 }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i))
		},
		{
			id: 'i - q',
			range: Array.from({ length: 9 }, (_, i) => String.fromCharCode('i'.charCodeAt(0) + i))
		},
		{
			id: 'r - z',
			range: Array.from({ length: 9 }, (_, i) => String.fromCharCode('r'.charCodeAt(0) + i))
		}
	];

	let tabs: Tab[] = iconGroupRanges.map((type) => {
		return { label: type.id, id: type.id } as Tab;
	});

	let activeIconGroupId = iconGroupRanges[0].id;
	let iconGroupsByLetter: { id: string; values: IconImageType[] }[] = [];

	onMount(async () => {
		iconGroupsByLetter = await getIconGroupsByLetter();
		if (selected) {
			for (const grp of iconGroupsByLetter) {
				if (grp.values.map((v) => v.alt).includes(selected)) {
					activeIconGroupId = grp.id;
				}
			}
		}
	});

	const dispatch = createEventDispatcher();

	const handleIconClick = (alt: string) => {
		selected = alt;
		dispatch('select', { alt });
	};

	const handleClosePopup = () => {
		dispatch('close');
	};

	const getIconGroupsByLetter = async () => {
		const data = images.reduce((r, e) => {
			const firstLetter = e.alt[0].toLowerCase();
			let groupData = { id: '', range: [] };

			iconGroupRanges.forEach((group) => {
				if (group.range.includes(firstLetter)) {
					groupData = group;
				}
			});

			// create group if not available
			if (!r[groupData.id]) {
				r[groupData.id] = [e];

				// add icon to existing group
			} else {
				r[groupData.id].push(e);
			}

			return r;
		}, {});

		const groups: { id: string; values: IconImageType[] }[] = [];

		Object.keys(data).forEach((key) => {
			groups.push({
				id: key,
				values: data[key]
			});
		});

		return groups;
	};
</script>

<div class="icon-image-picker-container" data-testid="icon-image-picker-container">
	<Tabs
		bind:tabs
		bind:activeTab={activeIconGroupId}
		on:tabChange={(e) => (activeIconGroupId = e.detail)}
		fontWeight="semibold"
	/>
	<button class="delete close is-radiusless" on:click={handleClosePopup}></button>

	<div class="card-icon">
		{#each iconGroupsByLetter as iconGroup}
			{#if activeIconGroupId === iconGroup.id}
				{#each iconGroup.values as spriteImage}
					<div
						role="button"
						tabindex="0"
						on:keydown={handleEnterKey}
						on:click={() => {
							handleIconClick(spriteImage.alt);
						}}
						title="Icon Picker Card"
					>
						<IconImagePickerCard
							alt={spriteImage.alt}
							src={spriteImage.src}
							isSelected={selected === spriteImage.alt}
						/>
					</div>
				{/each}
			{/if}
		{/each}
	</div>
</div>

<style lang="scss">
	.icon-image-picker-container {
		:global(.icon-text) {
			padding-left: 0.5rem;
			padding-right: 0.5rem;
		}
	}

	.card-icon {
		max-height: 190px;
		overflow-y: auto;

		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 5px;

		div {
			cursor: pointer;
			padding: 1px;

			&:hover {
				padding: 0;
				border: 1px solid hsl(204, 86%, 53%);
			}
		}
	}
	.close {
		position: absolute;
		top: 5px;
		right: 5px;
	}
</style>
