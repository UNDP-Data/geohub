<script lang="ts">
	import { page } from '$app/stores';
	import Notification from '$components/controls/Notification.svelte';
	import Star from '$components/data-view/Star.svelte';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DashboardMapStyle } from '$lib/types';
	import { CtaLink, Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher } from 'svelte';
	import Time from 'svelte-time';
	import { clickOutside } from 'svelte-use-click-outside';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	export let style: DashboardMapStyle;

	let showContextMenu = false;
	let confirmDeleteDialogVisible = false;
	let deletedStyleName = '';
	let isDeleting = false;

	const handleDeleteStyle = async () => {
		isDeleting = true;
		try {
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
		} finally {
			isDeleting = false;
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

	let imageLoaded = false;
</script>

<div class="map-card is-flex is-flex-direction-column">
	<div class="map-container">
		<a href={style.links.find((l) => l.rel === 'map').href}>
			<figure class="image is-5by3">
				<img
					alt={style.name}
					src={style.links
						.find((l) => l.rel === 'static-auto')
						.href.replace('{width}', '298')
						.replace('{height}', '180')}
					width="298"
					height="180"
					loading="lazy"
					on:load={() => {
						imageLoaded = true;
					}}
					on:error={() => {
						imageLoaded = true;
					}}
				/>
				{#if !imageLoaded}
					<div class="image-loader">
						<Loader size="medium" />
					</div>
				{/if}
			</figure>
		</a>
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
		<i class="{getAccessLevelIcon(style.access_level)} p-1 pr-2" />
		<CtaLink
			bind:label={style.name}
			isArrow={true}
			href={style.links.find((l) => l.rel === 'map').href}
		/>
	</p>
	<div class="justify-bottom">
		<div class="columns">
			<div class="column is-flex is-flex-direction-column">
				<div class="pb-2">
					<Star
						bind:id={style.id}
						bind:isStar={style.is_star}
						bind:no_stars={style.no_stars}
						table="style"
					/>
				</div>
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
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="modal-background" on:click={() => (confirmDeleteDialogVisible = false)} />
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Are you sure deleting this map?</p>
				<button
					class="delete"
					aria-label="close"
					title="Close"
					on:click={() => (confirmDeleteDialogVisible = false)}
				/>
			</header>
			<section class="modal-card-body is-size-6">
				<Notification type="warning" showCloseButton={false}>
					Unexpected bad things will happen if you don't read this!
				</Notification>
				<div class="has-text-weight-medium mt-2 mx-1">
					This action <b>cannot</b> be undone. This will delete
					<b>{style.name}</b>
					from GeoHub database. It will not be shared again with community.
					<br />
					Please type <b>{style.name}</b> to confirm.
				</div>
				<br />
				<input class="input" type="text" bind:value={deletedStyleName} />
			</section>
			<footer class="modal-card-foot">
				<button
					class="button is-primary is-fullwidth {isDeleting ? 'is-loading' : ''}"
					on:click={handleDeleteStyle}
					disabled={deletedStyleName !== style.name}
				>
					I understand the consequences, delete this map
				</button>
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
				position: relative;
				border: 1px solid gray;

				.image-loader {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
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
