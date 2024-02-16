<script lang="ts">
	import { page } from '$app/stores';
	import { AcceptedOrganisationDomains, AccessLevel } from '$lib/config/AppConfig';
	import { getDomainFromEmail } from '$lib/helper';
	import { createEventDispatcher } from 'svelte';
	import SegmentButtons, { type SegmentButton } from './SegmentButtons.svelte';

	const dispatch = createEventDispatcher();

	export let accessLevel: AccessLevel;
	export let disableOrganisation = false;
	export let disablePublic = false;

	let userName: string = $page.data.session?.user.name;
	let email = $page.data.session?.user.email;
	let domain: string = email ? getDomainFromEmail(email) : undefined;

	const handleAccessLevelClicked = (e) => {
		accessLevel = e.detail.value;
		dispatch('change');
	};

	const getSegmentButtons = () => {
		const buttons: SegmentButton[] = [
			{
				title: userName?.split(' ')[0] ?? 'me',
				value: AccessLevel.PRIVATE,
				icon: 'fa-solid fa-user-lock'
			}
		];

		if (domain && AcceptedOrganisationDomains.map((d) => d.domain).includes(domain)) {
			const name = AcceptedOrganisationDomains.find((d) => d.domain === domain).name;
			buttons.push({
				title: name.toUpperCase(),
				value: AccessLevel.ORGANIZATION,
				icon: 'fa-solid fa-building-lock',
				disabled: disableOrganisation
			});
		}

		buttons.push({
			title: 'Public',
			value: AccessLevel.PUBLIC,
			icon: 'fa-solid fa-lock-open',
			disabled: disablePublic
		});

		return buttons;
	};
</script>

<SegmentButtons
	buttons={getSegmentButtons()}
	bind:selected={accessLevel}
	on:change={handleAccessLevelClicked}
/>
