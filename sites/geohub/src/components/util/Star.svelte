<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { handleEnterKey } from '@undp-data/svelte-undp-components';
	import { toast } from '@zerodevx/svelte-toast';
	import millify from 'millify';
	import { onMount } from 'svelte';

	interface Props {
		id: string;
		isStar: boolean;
		isCompact?: boolean;
		table?: 'datasets' | 'style' | 'storymaps';
		no_stars?: number;
		size?: 'small' | 'normal' | 'medium' | 'large';
		ondelete?: () => void;
	}

	let {
		id = $bindable(),
		isStar = $bindable(),
		isCompact = $bindable(false),
		table = 'datasets',
		no_stars = $bindable(-1),
		size = 'small',
		ondelete = () => {}
	}: Props = $props();
	let isLoading = $state(false);

	let starLoading: Promise<number> | undefined = $state();

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
			if (ondelete) ondelete();
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
	{#if page.data.session}
		<button
			class="button is-{size} is-uppercase has-text-weight-bold"
			onclick={handleClicked}
			onkeydown={handleEnterKey}
			disabled={isLoading}
		>
			<span class="icon is-small">
				{#if isStar}
					<i class="fa-solid fa-star" style="color:#fccf03"></i>
				{:else}
					<i class="fa-regular fa-star"></i>
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
				<i class="fa-solid fa-star" style="color:#fccf03"></i>
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
		onclick={handleClicked}
		onkeydown={handleEnterKey}
		disabled={!page.data.session ? true : isLoading}
	>
		<span class="icon">
			{#if isStar}
				<i class="fa-solid fa-star fa-lg" style="color:#fccf03"></i>
			{:else}
				<i class="fa-regular fa-star fa-lg"></i>
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
