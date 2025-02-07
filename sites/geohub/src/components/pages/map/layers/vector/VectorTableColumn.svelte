<script lang="ts">
	import { browser } from '$app/environment';
	import {
		clean,
		Histogram,
		initTippy,
		initTooltipTippy,
		ModalTemplate,
		type VectorLayerTileStatAttribute
	} from '@undp-data/svelte-undp-components';

	let tippyInstance: { show: () => void; hide: () => void } | undefined;
	const tippy = initTippy({
		appendTo: browser ? document.body : undefined,
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

	interface Props {
		name: string;
		order?: 'asc' | 'desc';
		width?: number | undefined;
		attribute?: VectorLayerTileStatAttribute | undefined;
		isActive?: boolean;
		isFiltered?: boolean;
		showHistogram?: boolean;
		change?: (name: string, order: 'asc' | 'desc', isActive: boolean) => void;
	}

	let {
		name = $bindable(''),
		order = $bindable('desc'),
		width = $bindable(undefined),
		attribute = $bindable(undefined),
		isActive = $bindable(false),
		isFiltered = $bindable(false),
		showHistogram = $bindable(false),
		change = (name: string, order: 'asc' | 'desc', isActive: boolean) => {
			console.log(name, order, isActive);
		}
	}: Props = $props();

	let tooltipContent: HTMLElement | undefined = $state();
	let histogramAttribute: VectorLayerTileStatAttribute | undefined = $state(undefined);

	const onSortChanged = () => {
		if (change) {
			change(name, order, isActive);
		}

		if (tippyInstance && 'hide' in tippyInstance) {
			tippyInstance.hide();
		}
	};

	const handleSortClick = (value: 'asc' | 'desc') => {
		order = value;
		isActive = true;
		onSortChanged();
	};

	const handleResetSort = () => {
		isActive = false;
		onSortChanged();
	};

	const handleContextMenu = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		if (tippyInstance && 'show' in tippyInstance) {
			tippyInstance.show();
		}
	};

	const handleShowHistogram = () => {
		histogramAttribute = attribute;
		showHistogram = true;
		if (tippyInstance && 'hide' in tippyInstance) {
			tippyInstance.hide();
		}
	};
</script>

<button
	class="button sort-button"
	use:tippy={{ content: tooltipContent }}
	use:tippyTooltip={{
		content: `${clean(name)}`
	}}
	oncontextmenu={handleContextMenu}
>
	<span class="label is-flex" style={width ? `width: ${width}px;` : ''}>
		{#if isActive}
			<span class="icon is-small mr-0">
				<span class="material-symbols-outlined sort-icon">
					{#if order === 'desc'}
						arrow_upward
					{:else}
						arrow_downward
					{/if}
				</span>
			</span>
		{/if}
		{#if isFiltered}
			<span class="material-symbols-outlined"> filter_alt </span>
		{/if}
		<p class="name">{clean(name)}</p>
	</span>
</button>

<div class="context-menu" bind:this={tooltipContent}>
	<div class="navbar">
		<ul>
			{#if isActive}
				<li>
					<button class="is-flex is-align-items-center p-2" onclick={handleResetSort}>
						<span class="icon is-small material-symbols-outlined mr-2"> clear_all </span>
						<span> Reset sort </span>
					</button>
				</li>
			{/if}
			{#if !(isActive && order === 'asc')}
				<li>
					<button
						class="is-flex is-align-items-center p-2"
						onclick={() => {
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
						onclick={() => {
							handleSortClick('desc');
						}}
					>
						<span class="icon is-small material-symbols-outlined mr-2"> arrow_upward </span>
						<span>Sort descending </span>
					</button>
				</li>
			{/if}
			{#if attribute && attribute.histogram}
				<li>
					<button class="is-flex is-align-items-center p-2" onclick={handleShowHistogram}>
						<span class="icon is-small material-symbols-outlined mr-2"> bar_chart </span>
						<span>Show histogram</span>
					</button>
				</li>
			{/if}
		</ul>
	</div>
</div>

{#if histogramAttribute && histogramAttribute.histogram}
	<ModalTemplate title="Histogram" bind:show={showHistogram} width="450px">
		{#snippet content()}
			<div>
				<Histogram
					bind:counts={histogramAttribute.histogram.count}
					bind:bins={histogramAttribute.histogram.bins}
					yLabel="Count"
					xLabel={clean(name)}
				/>
			</div>
		{/snippet}
	</ModalTemplate>
{/if}

<style lang="scss">
	.sort-button {
		border: none;
		padding: 0;
		background: transparent;
		box-shadow: none;

		.sort-icon {
			font-size: 20px;
		}

		.name {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
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
