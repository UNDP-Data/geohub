<script lang="ts">
	import { page } from '$app/stores';
	import { AcceptedOrganisationDomains, AccessLevel } from '$lib/config/AppConfig';
	import { getDomainFromEmail } from '$lib/helper';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let accessLevel: AccessLevel;
	export let disableOrganisation = false;
	export let disablePublic = false;

	let userName: string = $page.data.session?.user.name;
	let email = $page.data.session?.user.email;
	let domain: string = email ? getDomainFromEmail(email) : undefined;

	const handleAccessLevelClicked = (level: AccessLevel) => {
		accessLevel = level;
		dispatch('change');
	};
</script>

<div class="field has-addons">
	<p class="control">
		<button
			type="button"
			class="button is-normal {`${accessLevel === AccessLevel.PRIVATE ? 'is-link is-active' : ''}`}"
			on:click={() => handleAccessLevelClicked(AccessLevel.PRIVATE)}
		>
			<span>
				<i class="fa-solid fa-user-lock" />
				<b>{userName?.split(' ')[0] ?? 'me'}</b>
			</span>
		</button>
	</p>
	{#if domain && AcceptedOrganisationDomains.map((d) => d.domain).includes(domain)}
		{@const name = AcceptedOrganisationDomains.find((d) => d.domain === domain).name}
		<p class="control">
			<button
				type="button"
				class="button is-normal {`${
					accessLevel === AccessLevel.ORGANIZATION ? 'is-link is-active' : ''
				}`}"
				on:click={() => handleAccessLevelClicked(AccessLevel.ORGANIZATION)}
				disabled={disableOrganisation}
			>
				<span class="is-uppercase has-text-weight-bold">
					<i class="fa-solid fa-building-lock" />
					{name}
				</span>
			</button>
		</p>
	{/if}
	<p class="control">
		<button
			type="button"
			class="button is-normal {`${accessLevel === AccessLevel.PUBLIC ? 'is-link is-active' : ''}`}"
			on:click={() => handleAccessLevelClicked(AccessLevel.PUBLIC)}
			disabled={disablePublic}
		>
			<span>
				<i class="fa-solid fa-lock-open" />
				<b>Public</b>
			</span>
		</button>
	</p>
</div>
