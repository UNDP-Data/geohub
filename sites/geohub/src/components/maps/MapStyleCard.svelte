<script lang="ts">
	import { page } from '$app/stores';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { handleEnterKey, sleep } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import { Button, CtaLink, Loader } from '@undp-data/svelte-undp-design';
	import { Map, type StyleSpecification } from 'maplibre-gl';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time';
	import { clickOutside } from 'svelte-use-click-outside';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let style: DashboardMapStyle;
	let mapContainer: HTMLDivElement;
	let map: Map;
	let isLoading = false;

	let showContextMenu = false;
	let confirmDeleteDialogVisible = false;

	let styleJSON: StyleSpecification;

	let headerIcon = '';

	$: if (mapContainer) {
		inistialiseMap();
	}

	const inistialiseMap = async () => {
		if (!mapContainer) return;
		if (map) return;
		try {
			isLoading = true;

			const stylejson = style.links.find((l) => l.rel === 'stylejson').href;
			const res = await fetch(stylejson);
			styleJSON = await res.json();

			while (mapContainer === null) {
				await sleep(100);
			}

			map = new Map({
				container: mapContainer,
				style: styleJSON,
				center: styleJSON.center ? [styleJSON.center[0], styleJSON.center[1]] : [0, 0],
				zoom: styleJSON.zoom ? styleJSON.zoom : 4,
				attributionControl: false,
				interactive: false
			});

			if (map.loaded()) {
				isLoading = false;
			} else {
				map.on('load', () => {
					isLoading = false;
				});
			}
		} catch (err) {
			console.error(err);
			isLoading = false;
		}
	};

	const handleDeleteStyle = async () => {
		const apiUrl = style.links.find((l) => l.rel === 'self').href;
		const res = await fetch(apiUrl, {
			method: 'DELETE'
		});
		if (res.ok) {
			dispatch('deleted', {
				style: style
			});
			confirmDeleteDialogVisible = false;
		}
	};

	const handleClose = () => {
		showContextMenu = false;
	};

	$: {
		if (showContextMenu !== true) {
			setTimeout(handleClose, 100);
		}
	}

	if (style.access_level) {
		if (style.access_level === AccessLevel.PRIVATE) {
			headerIcon = 'fa-solid fa-user-lock has-text-primary';
		} else if (style.access_level === AccessLevel.ORGANIZATION) {
			headerIcon = 'fa-solid fa-building-lock has-text-primary';
		} else {
			headerIcon = 'fa-solid fa-lock-open has-text-primary';
		}
	}

	const openSavedMapEditor = () => {
		const mapurl = style.links.find((l) => l.rel === 'map').href;
		document.location = mapurl;
	};
</script>

<div class="map-card is-flex is-flex-direction-column">
	<div class="map-container">
		<div
			class="image pointor has-tooltip-bottom has-tooltip-arrow"
			data-tooltip="Open map"
			role="button"
			tabindex="0"
			on:click={openSavedMapEditor}
			on:keydown={handleEnterKey}
			bind:this={mapContainer}
		>
			{#if isLoading}
				<Loader size="medium" />
			{/if}
		</div>
		{#if $page.data.session && style.created_user === $page.data.session.user.email}
			<div class="delete-button has-tooltip-left has-tooltip-arrow" data-tooltip="Delete map">
				<button class="button is-link ml-2" on:click={() => (confirmDeleteDialogVisible = true)}>
					<span class="icon is-small">
						<i class="fas fa-trash"></i>
					</span>
				</button>
			</div>
		{/if}
	</div>
	<p class="py-2 is-flex">
		<i class="{headerIcon} p-1 pr-2" />
		<CtaLink bind:label={style.name} isArrow={true} on:clicked={openSavedMapEditor} />
	</p>
	<div class="justify-bottom">
		<div class="columns">
			<div class="column is-flex is-flex-direction-column">
				<p class="p-0 m-0">
					<b>Created at: </b><Time timestamp={style.createdat} format="h:mm A · MMMM D, YYYY" />
				</p>
				{#if style.created_user}
					<p class="p-0 m-0">
						<b>Created by: </b>{style.created_user}
					</p>
				{/if}
				<p class="p-0 m-0">
					<b>Updated at: </b><Time timestamp={style.updatedat} format="h:mm A · MMMM D, YYYY" />
				</p>
				{#if style.updated_user}
					<p class="p-0 m-0">
						<b>Updated by: </b>{style.updated_user}
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if confirmDeleteDialogVisible}
	<div
		class="modal is-active"
		transition:fade|global
		use:clickOutside={() => (confirmDeleteDialogVisible = false)}
	>
		<div class="modal-background" />
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Delete Style</p>
				<button
					class="delete"
					aria-label="close"
					title="Close"
					on:click={() => (confirmDeleteDialogVisible = false)}
				/>
			</header>
			<section class="modal-card-body is-size-6 has-text-weight-normal">
				<div class="has-text-weight-medium">Are you sure you want to delete this style?</div>
				<br />
				{style.name}
			</section>
			<footer class="modal-card-foot">
				<div class="px-1" style="width: 50%">
					<Button
						title="Cancel"
						isPrimary={false}
						on:clicked={() => (confirmDeleteDialogVisible = false)}
					/>
				</div>
				<div class="px-1" style="width: 50%">
					<Button title="Delete" isPrimary={true} on:clicked={handleDeleteStyle} />
				</div>
			</footer>
		</div>
	</div>
{/if}

<style lang="scss">
	.map-card {
		box-sizing: border-box;

		.map-container {
			position: relative;

			.image {
				max-width: 100%;
				height: 300px;
				border: 1px solid gray;

				@media (max-width: 48em) {
					height: 200px;
				}

				:global(.loader) {
					position: absolute;
					top: calc(45%);
					left: calc(45%);

					@media (max-width: 48em) {
						top: calc(35%);
						left: calc(40%);
					}
				}
			}

			.delete-button {
				position: absolute;
				top: 5px;
				right: 5px;
			}
		}

		p::first-letter {
			text-transform: capitalize;
		}

		.pointor {
			cursor: pointer;
		}

		:global(.cta__link) {
			text-overflow: ellipsis;
			text-transform: capitalize;
		}

		.justify-bottom {
			margin-top: auto;
			margin-bottom: 1rem;
		}
	}
</style>
