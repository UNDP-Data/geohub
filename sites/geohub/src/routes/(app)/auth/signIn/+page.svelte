<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn } from '@auth/sveltekit/client';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let previousPage: URL = $state(new URL($page.url.origin));
	afterNavigate(({ from }) => {
		if (from?.url) {
			previousPage = from?.url;
		}
	});
</script>

<div class="login-container message is-link">
	<div
		class="px-5 py-4 has-background-light has-text-dark has-text-weight-semibold is-uppercase is-size-6"
	>
		Sign In
	</div>
	<div class="p-5">
		{#if data.providers?.length > 0}
			<p class="is-6 has-text-justified has-text-dark pb-4">GeoHub allows you to login with:</p>
			{#each data.providers as provider, index}
				<button
					class="login-button button is-medium is-fullwidth is-link"
					onclick={() => signIn(provider.id, { callbackUrl: previousPage.href })}
				>
					<span class="icon is-small">
						{#if provider.icon.startsWith('fa')}
							<i class={provider.icon}></i>
						{:else}
							<img src={provider.icon} alt="logo" width="24" class="mr-1" />
						{/if}
					</span>
					<span class="is-uppercase has-text-weight-bold is-size-6">{provider.label}</span>
				</button>
				<p class="has-text-grey pt-2 {index < data.providers.length - 1 ? 'pb-4' : ''} is-size-7">
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html provider.description}
				</p>
			{/each}
		{:else}
			No authentication provider is available. Please configure server settings.
		{/if}
	</div>
</div>

<style lang="scss">
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

		@media (max-height: 24em) {
			max-height: 240px;
			overflow-y: auto;
			top: 30px;
			bottom: 0;
			transform: translateX(-50%);
			-webkit-transform: translateX(-50%);
			-ms-transform: translateX(-50%);
		}

		.login-button {
			&:hover {
				background-color: #005893;
				color: white;
			}
		}
	}
</style>
