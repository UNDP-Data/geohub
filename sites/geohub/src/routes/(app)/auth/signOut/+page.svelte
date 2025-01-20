<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';

	let previousPage: URL = $state(new URL(page.url.origin));
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
		Sign Out
	</div>
	<div class="p-5">
		<p class="subtitle is-6 has-text-justified has-text-dark">
			You have already signed in. To sign in by another account, please sign out first.
		</p>
		<button
			class="button is-link is-normal is-fullwidth"
			onclick={() => signOut({ callbackUrl: previousPage.href })}
		>
			Sign out
		</button>
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
	}
</style>
