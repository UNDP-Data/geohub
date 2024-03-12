<script lang="ts">
	import IconImagePickerCard from '$components/maplibre/symbol/IconImagePickerCard.svelte';
	import { SPRITEIMAGE_CONTEXT_KEY, type SpriteImageStore } from '$stores';
	import { Tabs, handleEnterKey, type Tab } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const spriteImageList: SpriteImageStore = getContext(SPRITEIMAGE_CONTEXT_KEY);

	export let iconImageAlt: string;

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
	let iconGroupsByLetter = [];

	onMount(() => {
		iconGroupsByLetter = getIconGroupsByLetter();
	});

	const dispatch = createEventDispatcher();

	const handleIconClick = (spriteImageAlt: string) => {
		dispatch('handleIconClick', { spriteImageAlt });
	};

	const handleClosePopup = () => {
		dispatch('handleClosePopup');
	};

	const getIconGroupsByLetter = () => {
		const data = $spriteImageList.reduce((r, e) => {
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

		const groups = [];

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
