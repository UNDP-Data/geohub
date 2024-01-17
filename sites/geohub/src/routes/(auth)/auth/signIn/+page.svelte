<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import MapHero from '$components/pages/home/MapHero.svelte';
	import { MapStyleId } from '$lib/config/AppConfig';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { PageData } from './$types';
	export let data: PageData;

	let previousPage: URL = new URL($page.url.origin);
	afterNavigate(({ from }) => {
		if (from?.url) {
			previousPage = from?.url;
		}
	});
</script>

<div class="map-hero">
	<MapHero styleId={MapStyleId} interactive={false} />

	<div class="login-container message is-link">
		<div
			class="px-5 py-4 has-background-light has-text-dark has-text-weight-semibold is-uppercase is-size-6"
		>
			Sign in
		</div>
		<div class="p-5">
			{#if data.session}
				<p class="subtitle is-6 has-text-justified has-text-dark">
					You have already signed in. To sign in by another account, please sign out first.
				</p>
				<button class="button is-link is-normal is-fullwidth" on:click={() => signOut()}>
					Sign out
				</button>
			{:else}
				<p class="is-6 has-text-justified has-text-dark pb-4">GeoHub allows you to login with:</p>
				{#each data.providers as provider, index}
					<button
						class="login-button button is-medium is-fullwidth is-link"
						on:click={() => signIn(provider.id, { callbackUrl: previousPage.href })}
					>
						<span class="icon is-small">
							{#if provider.icon.startsWith('fa')}
								<i class={provider.icon}></i>
							{:else}
								<img src={provider.icon} alt="logo" width="24" class="mr-1" />
							{/if}
						</span>
						<span class="is-uppercase has-text-weight-semibold is-size-6">{provider.label}</span>
					</button>
					<p class="has-text-grey pt-2 {index < data.providers.length - 1 ? 'pb-4' : ''} is-size-7">
						<!-- eslint-disable svelte/no-at-html-tags -->
						{@html provider.description}
					</p>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	$height: calc(100vh);

	.map-hero {
		position: relative;

		.login-container {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
			-webkit-transform: translateX(-50%) translateY(-50%);
			-ms-transform: translateX(-50%) translateY(-50%);

			height: fit-content;
			width: 360px;
			background-color: rgba(255, 255, 255, 1);

			.login-button {
				&:hover {
					background-color: #005893;
					color: white;
				}
			}
		}
	}
</style>
