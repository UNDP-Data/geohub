<script lang="ts">
	import { clean, initTippy, initTooltipTippy } from '@undp-data/svelte-undp-components';
	import { createEventDispatcher } from 'svelte';

	let tippyInstance: { show: () => void } | undefined;
	const tippy = initTippy({
		appendTo: document.body,
		placement: 'bottom-start',
		offset: [0, 7],
		arrow: false,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		trigger: 'click',
		onCreate: (instance) => {
			tippyInstance = instance;
		},
		onDestroy: () => {
			tippyInstance = undefined;
		}
	});
	const tippyTooltip = initTooltipTippy();
	const dispatch = createEventDispatcher();

	export let name: string;
	export let order: 'asc' | 'desc' = 'desc';
	export let width: number | undefined = undefined;
	export let isActive = false;
	export let isFiltered = false;

	let tooltipContent: HTMLElement;

	const handleSortClick = (value: 'asc' | 'desc') => {
		order = value;
		isActive = true;
		dispatch('change', {
			name: name,
			order: order,
			isActive: isActive
		});
	};

	const handleResetSort = () => {
		isActive = false;
		dispatch('change', {
			name: name,
			order: order,
			isActive: isActive
		});
	};

	const handleContextMenu = () => {
		if (tippyInstance && 'show' in tippyInstance) {
			tippyInstance.show();
		}
	};
</script>

<button
	class="button sort-button"
	use:tippy={{ content: tooltipContent }}
	use:tippyTooltip={{
		content: `${clean(name)}`
	}}
	on:contextmenu|preventDefault={handleContextMenu}
>
	<span class="label is-flex" style={width ? `max-width: ${width}px;` : ''}>
		{#if isFiltered}
			<span class="material-symbols-outlined"> filter_alt </span>
		{/if}
		<p class="name">{clean(name)}</p>
	</span>

	{#if isActive}
		<span class="ml-auto icon is-small">
			<span class="material-symbols-outlined sort-icon">
				{#if order === 'desc'}
					arrow_upward
				{:else}
					arrow_downward
				{/if}
			</span>
		</span>
	{/if}
</button>

<div class="context-menu" bind:this={tooltipContent}>
	<div class="navbar">
		<ul>
			{#if isActive}
				<li>
					<button class="is-flex is-align-items-center p-2" on:click={handleResetSort}>
						<span class="icon is-small material-symbols-outlined mr-2"> clear_all </span>
						<span> Reset sort </span>
					</button>
				</li>
			{/if}
			{#if !(isActive && order === 'asc')}
				<li>
					<button
						class="is-flex is-align-items-center p-2"
						on:click={() => {
							handleSortClick('asc');
						}}
					>
						<span class="icon is-small material-symbols-outlined mr-2"> arrow_downward </span>
						<span> Sort ascending </span>
					</button>
				</li>
			{/if}
			{#if !(isActive && order === 'desc')}
				<li>
					<button
						class="is-flex is-align-items-center p-2"
						on:click={() => {
							handleSortClick('desc');
						}}
					>
						<span class="icon is-small material-symbols-outlined mr-2"> arrow_upward </span>
						<span>Sort descending </span>
					</button>
				</li>
			{/if}
		</ul>
	</div>
</div>

<style lang="scss">
	.name {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	.sort-button {
		border: none;
		padding: 0;
		background: transparent;
		box-shadow: none;

		.sort-icon {
			font-size: 16px;
			margin-bottom: auto;
		}
	}

	:global(.tippy-content:has(.context-menu)) {
		padding: 0;
	}

	.context-menu {
		.navbar {
			display: inline-flex;
			border: 1px #d4d6d8 solid;
			width: fit-content;
			min-width: 150px;
			background-color: #fff;
			border-radius: 0;
			overflow: hidden;
			flex-direction: column;
			box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.1);

			ul {
				margin: 6px 0;
			}
		}

		ul li {
			display: block;
			list-style-type: none;
			width: 1fr;

			button {
				font-size: 1rem;
				color: #232e3d;
				width: 100%;
				height: 30px;
				border: 0px;
				background-color: #fff;

				&:hover {
					color: #000;
					background-color: #edeff0;
				}
			}
		}
	}
</style>
