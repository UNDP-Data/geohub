<script lang="ts">
	import { page } from '$app/stores';
	import { AcceptedOrganisationDomains, AccessLevel } from '$lib/config/AppConfig';
	import { getDomainFromEmail } from '$lib/helper';
	import { SegmentButtons, type SegmentButton } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let accessLevel: AccessLevel;
	export let disableOrganisation = false;
	export let disablePublic = false;
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'normal';
	export let disabled = false;
	/**
	 * Segment button or select box
	 */
	export let isSegmentButton = true;

	let userName: string = $page.data.session?.user.name;
	let email = $page.data.session?.user.email;
	let domain: string | undefined = email ? getDomainFromEmail(email) : undefined;

	const handleAccessLevelClicked = (e) => {
		accessLevel = e.detail.value;
		dispatch('change');
	};

	const handleSelectClicked = () => {
		dispatch('change');
	};

	const getSegmentButtons = () => {
		const buttons: SegmentButton[] = [
			{
				title: userName?.split(' ')[0] ?? 'me',
				value: AccessLevel.PRIVATE,
				disabled: disabled
			}
		];

		if (domain && AcceptedOrganisationDomains.map((d) => d.domain).includes(domain)) {
			const name = AcceptedOrganisationDomains.find((d) => d.domain === domain)?.name;
			buttons.push({
				title: name ? name.toUpperCase() : 'Private',
				value: AccessLevel.ORGANIZATION,
				disabled: disableOrganisation || disabled
			});
		}

		buttons.push({
			title: 'Public',
			value: AccessLevel.PUBLIC,
			disabled: disablePublic || disabled
		});

		return buttons;
	};
</script>

{#key disabled}
	{#key disableOrganisation}
		{#key disablePublic}
			{#if isSegmentButton}
				<SegmentButtons
					buttons={getSegmentButtons()}
					bind:selected={accessLevel}
					bind:size
					on:change={handleAccessLevelClicked}
				/>
			{:else}
				<div class="select is-fullwidth">
					<select bind:value={accessLevel} on:change={handleSelectClicked}>
						{#each getSegmentButtons() as item}
							<option value={item.value}>{item.title}</option>
						{/each}
					</select>
				</div>
			{/if}
		{/key}
	{/key}
{/key}
