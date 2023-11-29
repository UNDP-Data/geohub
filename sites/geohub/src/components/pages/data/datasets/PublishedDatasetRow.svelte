<script lang="ts">
	import Star from '$components/util/Star.svelte';
	import { SdgLogos } from '$lib/config/AppConfig';
	import { getAccessLevelIcon, initTippy } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { marked } from 'marked';
	import Time from 'svelte-time';

	export let feature: DatasetFeature;

	const accessIcon = getAccessLevelIcon(feature.properties.access_level, true);

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
</script>

<svelte:window bind:innerWidth />

<div class="row">
	<a class="has-text-black" href={feature.properties.links.find((l) => l.rel === 'dataset').href}>
		<div class="columns is-vcentered m-0 is-mobile is-multiline">
			<div class="column py-1 is-3-desktop is-flex is-align-items-center">
				{#if accessIcon}
					<i class="{accessIcon} p-1 pr-2" />
				{/if}
				<span>{feature.properties.name}</span>
			</div>

			<div class="column py-1 is-2 hidden-mobile">
				<span class="description is-size-7">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked(feature.properties.description)}
				</span>
			</div>

			<div class="column py-1 is-2 hidden-mobile">
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
			</div>
			<div class="column py-1 is-2 hidden-mobile">
				{feature.properties.license?.length > 0 ? feature.properties.license : 'No license'}
			</div>
			<div class="column py-1 is-2 hidden-mobile">
				<Time timestamp={feature.properties.updatedat} format="HH:mm, MM/DD/YYYY" />
			</div>
			<div class="column py-1 is-1">
				<Star
					isCompact={true}
					bind:id={feature.properties.id}
					bind:isStar={feature.properties.is_star}
					bind:no_stars={feature.properties.no_stars}
					table="datasets"
				/>
			</div>
		</div>
	</a>
</div>

<style lang="scss">
	.row {
		border-bottom: 1px solid gray;
	}

	.description {
		align-items: center;

		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.hidden-mobile {
		display: block;
		@media (max-width: 48em) {
			display: none;
		}
	}

	.show-mobile {
		display: none;
		@media (max-width: 48em) {
			display: block;
		}
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

	.detail-panel {
		border-top: 1px dashed gray;
	}
</style>
