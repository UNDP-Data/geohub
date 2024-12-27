<script lang="ts">
	import type { DashboardMapStyle } from '$lib/types';
	import { CopyToClipboard, FieldControl, ModalTemplate } from '@undp-data/svelte-undp-components';

	export let style: DashboardMapStyle;
	export let isModalVisible = false;

	$: if (isModalVisible) {
		open();
	}

	let showDevLink = false;
	let mapUrl = '';
	let mapStyleUrl = '';

	const open = () => {
		mapUrl = style?.links?.find((l) => l.rel === 'map')?.href as string;
		mapStyleUrl = style?.links?.find((l) => l.rel === 'stylejson')?.href as string;
	};
</script>

<ModalTemplate title="Share map" bind:show={isModalVisible}>
	<div slot="content">
		<FieldControl title="Map URL" fontWeight="bold" showHelp={false} isFirstCharCapitalized={false}>
			<div slot="control">
				<CopyToClipboard value={mapUrl} />
			</div>
		</FieldControl>

		<button
			class="show-dev-link mt-4 mb-5"
			on:click={() => {
				showDevLink = !showDevLink;
			}}
		>
			<span class="mr-2">
				<i
					class="fa-solid fa-chevron-down toggle-icon {showDevLink
						? 'active'
						: ''} has-text-primary"
				></i>
			</span>
			<span class="has-text-grey-dark is-uppercase has-text-weight-bold"
				>Show links for developers</span
			>
		</button>

		{#if showDevLink}
			<FieldControl
				title="Map Style URL"
				fontWeight="bold"
				showHelp={false}
				isFirstCharCapitalized={false}
			>
				<div slot="control">
					<CopyToClipboard value={mapStyleUrl} />
				</div>
			</FieldControl>
		{/if}
	</div>
</ModalTemplate>

<style lang="scss">
	.show-dev-link {
		.toggle-icon {
			-webkit-transition: all 0.3s ease;
			-moz-transition: all 0.3s ease;
			-ms-transition: all 0.3s ease;
			-o-transition: all 0.3s ease;
			transition: all 0.3s ease;

			&.active {
				transform: rotate(-180deg);
				-webkit-transform: rotate(-180deg);
				-moz-transform: rotate(-180deg);
				-ms-transform: rotate(-180deg);
				-o-transform: rotate(-180deg);
				transition: rotateZ(-180deg);
			}
		}
	}
</style>
