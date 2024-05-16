<script lang="ts">
	import Star from '$components/util/Star.svelte';
	import { SdgLogos } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { initTippy } from '@undp-data/svelte-undp-components';
	import { marked } from 'marked';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time';

	const dispatch = createEventDispatcher();

	export let feature: DatasetFeature;
	export let dispatchEvent = false;

	const accessIcon = getAccessLevelIcon(feature.properties.access_level, true);

	const datasetLink = feature.properties.links.find((l) => l.rel === 'dataset').href;

	let isHovered = false;
	let innerWidth = 0;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const sdgs = tags
		.filter((t) => t.key === 'sdg_goal')
		.sort((a, b) => parseInt(a.value) - parseInt(b.value));

	const tippy = initTippy({
		placement: 'bottom-end',
		arrow: true,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		trigger: 'mouseenter focus',
		interactive: false,
		offset: [10, 10],
		onShow(instance) {
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		}
	});
	let tooltipContent: HTMLElement;

	const handleClicked = () => {
		if (!dispatchEvent) return;
		dispatch('selected', feature);
	};
</script>

<svelte:window bind:innerWidth />

<tr
	on:mouseenter={() => {
		isHovered = true;
	}}
	on:mouseleave={() => {
		isHovered = false;
	}}
>
	<td>
		<a
			class="col {isHovered ? 'has-text-link' : 'has-text-black'}"
			href={dispatchEvent ? undefined : datasetLink}
			on:click={dispatchEvent ? handleClicked : undefined}
		>
			<div class="dataset_name is-flex">
				<span class="mr-2">
					{feature.properties.name}
				</span>
				{#if accessIcon}
					<span class="icon ml-auto">
						<i class={accessIcon} />
					</span>
				{/if}
			</div>
		</a>
	</td>

	<td>
		<a
			class="col {isHovered ? 'has-text-link' : 'has-text-black'}"
			href={dispatchEvent ? undefined : datasetLink}
			on:click={dispatchEvent ? handleClicked : undefined}
		>
			<span class="description is-size-7">
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html marked(feature.properties.description)}
			</span>
		</a>
	</td>

	<td>
		<a
			class="col {isHovered ? 'has-text-link' : 'has-text-black'}"
			href={dispatchEvent ? undefined : datasetLink}
			on:click={dispatchEvent ? handleClicked : undefined}
		>
			{#if sdgs.length > 0}
				<div class="sdg-grid">
					{#each sdgs as sdg, index}
						{@const logo = SdgLogos.find((s) => s.value === parseInt(sdg.value))}
						{#if index < 3}
							<div
								class="sdg_number has-text-white has-text-weight-bold is-size-7"
								style="background-color: {logo.color};"
							>
								{logo.value}
							</div>
						{/if}
					{/each}
					{#if sdgs.length > 3}
						<div
							class="sdg_number border has-text-black has-text-weight-bold is-size-7"
							style="background-color: #FFFFFF;"
							use:tippy={{ content: tooltipContent }}
						>
							...
						</div>

						<div class="tooltip sdg-grid p-2" role="menu" bind:this={tooltipContent}>
							{#each sdgs.slice(3) as sdg}
								{@const logo = SdgLogos.find((s) => s.value === parseInt(sdg.value))}
								<div
									class="sdg_number has-text-white has-text-weight-bold is-size-7"
									style="background-color: {logo.color};"
								>
									{logo.value}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				N/A
			{/if}
		</a>
	</td>
	<td>
		<a
			class="col {isHovered ? 'has-text-link' : 'has-text-black'}"
			href={dispatchEvent ? undefined : datasetLink}
			on:click={dispatchEvent ? handleClicked : undefined}
		>
			{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
		</a>
	</td>
	<td>
		<a
			class="col {isHovered ? 'has-text-link' : 'has-text-black'}"
			href={dispatchEvent ? undefined : datasetLink}
			on:click={dispatchEvent ? handleClicked : undefined}
		>
			<Time timestamp={feature.properties.updatedat} format="HH:mm, MM/DD/YYYY" />
		</a>
	</td>
	<td>
		<Star
			isCompact={true}
			bind:id={feature.properties.id}
			bind:isStar={feature.properties.is_star}
			bind:no_stars={feature.properties.no_stars}
			table="datasets"
		/>
	</td>
</tr>

<style lang="scss">
	.link {
		display: block;
		padding: 0.5em 0.5em 0.5em 0em;
	}

	.dataset_name {
		width: fit-content;
		align-items: center;

		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.description {
		max-width: 250px;
		align-items: center;

		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	.sdg-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 5px;

		.sdg_number {
			width: 28px;
			height: 28px;
			padding-top: 5px;
			border-radius: 50%;
			text-align: center;
			box-sizing: border-box;
		}

		.border {
			border: 1px solid black;
		}
	}

	.col {
		cursor: pointer;
	}
</style>
