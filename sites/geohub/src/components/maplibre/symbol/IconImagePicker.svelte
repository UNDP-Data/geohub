<script lang="ts">
	import IconImagePickerCard from '$components/maplibre/symbol/IconImagePickerCard.svelte';
	import type { SpriteImage } from '$lib/types';
	import { Tabs, handleEnterKey, type Tab } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, onMount } from 'svelte';

	export let iconImageAlt: string;

	let spriteimageList: SpriteImage[] = [];
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
	let iconGroupsByLetter: { id: string; values: SpriteImage[] }[] = [];

	onMount(async () => {
		iconGroupsByLetter = await getIconGroupsByLetter();
	});

	const dispatch = createEventDispatcher();

	const handleIconClick = (spriteImageAlt: string) => {
		dispatch('handleIconClick', { spriteImageAlt });
	};

	const handleClosePopup = () => {
		dispatch('handleClosePopup');
	};

	const getIconGroupsByLetter = async () => {
		if (spriteimageList.length === 0) {
			const res = await fetch(`/api/mapstyle/sprite/images`);
			spriteimageList = await res.json();
		}

		const data = spriteimageList.reduce((r, e) => {
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

		const groups: { id: string; values: SpriteImage[] }[] = [];

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
							iconImageAlt={spriteImage.alt}
							iconImageSrc={spriteImage.src}
							isSelected={iconImageAlt === spriteImage.alt}
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
