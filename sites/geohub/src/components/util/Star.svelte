<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { handleEnterKey } from '$lib/helper';
	import { toast } from '@zerodevx/svelte-toast';
	import millify from 'millify';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	export let id: string;
	export let isStar: boolean;
	export let isCompact = false;
	export let table: 'datasets' | 'style' = 'datasets';
	export let no_stars = -1;
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'small';
	let isLoading = false;

	let starLoading: Promise<number>;

	onMount(() => {
		if (no_stars === -1) {
			starLoading = getStarCount();
		}
	});

	const updateStar = async (method: 'POST' | 'DELETE') => {
		isLoading = true;
		try {
			const res = await fetch(`/api/${table}/${id}/star`, {
				method: method
			}).catch((err) => {
				toast.push(err.message);
				throw err;
			});
			const json = await res.json();
			no_stars = json.no_stars;
		} finally {
			isLoading = false;
		}
	};

	const handleClicked = async () => {
		if (isStar) {
			// delete star
			await updateStar('DELETE');
			dispatch('starDeleted', {
				dataset_id: id
			});
		} else {
			// add star
			await updateStar('POST');
		}
		isStar = !isStar;
		await getStarCount();
	};

	const getStarCount = async () => {
		const res = await fetch(`/api/${table}/${id}/star/count`);
		const json = await res.json();
		no_stars = json.no_stars;
		return no_stars;
	};
</script>

{#if !isCompact}
	{#if $page.data.session}
		<button
			class="button is-{size} is-uppercase has-text-weight-bold"
			on:click={handleClicked}
			on:keydown={handleEnterKey}
			disabled={isLoading}
		>
			<span class="icon is-small">
				{#if isStar}
					<i class="fa-solid fa-star" style="color:#fccf03" />
				{:else}
					<i class="fa-regular fa-star" />
				{/if}
			</span>
			<span>
				{#if isStar}
					Starred
				{:else}
					Star
				{/if}
				{#if browser}
					{#await starLoading then}
						<div class="Counter">{millify(no_stars)}</div>
					{/await}
				{/if}
			</span>
		</button>
	{:else}
		<button class="button is-{size}" disabled>
			<span class="icon">
				<i class="fa-solid fa-star" style="color:#fccf03" />
			</span>
			<span class="star-container-no-login">
				Star
				{#if browser}
					{#await starLoading then}
						<div class="Counter">{millify(no_stars)}</div>
					{/await}
				{/if}
			</span>
		</button>
	{/if}
{:else}
	<button
		class="star-button"
		on:click={handleClicked}
		on:keydown={handleEnterKey}
		disabled={!$page.data.session ? true : isLoading}
	>
		<span class="icon">
			{#if isStar}
				<i class="fa-solid fa-star fa-lg" style="color:#fccf03" />
			{:else}
				<i class="fa-regular fa-star fa-lg" />
			{/if}
		</span>
	</button>
{/if}

<style lang="scss">
	.Counter {
		background-color: #1b1f2413;
		border-radius: 2em;
		display: inline-block;
		font-size: 12px;
		font-weight: 500;
		line-height: calc(20px - 1px * 2);
		min-width: 20px;
		padding: 0 6px;
		text-align: center;
	}

	.star-button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		outline: none;
		padding: 0;
		appearance: none;
	}
</style>
