<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { SidebarPosition } from './SidebarPosition';

	/**
	 * Show sidebar if true. Default is true
	 */
	export let show = true;

	/**
	 * Sidebar position either 'left' or 'right'. Default is left
	 */
	export let position: SidebarPosition = 'left';

	/**
	 * Fixed sidebar width. default is 360px
	 */
	export let width = '360px';

	/**
	 * If you use some header component at the above of sidebar, you can define margin-top value here
	 */
	export let marginTop = 0;

	/**
	 * If enabled, show toggle button. Default is true
	 */
	export let showToggleButton = true;

	/**
	 * If height is specified, it will not be sized automatically
	 */
	export let height: number | undefined = undefined;

	/**
	 * Default sidebar border style
	 */
	export let border = '1px solid #1c1c1c';

	let innerWidth: number;
	let innerHeight: number;
	$: isMobile = innerWidth < 768 ? true : false;
	$: defaultMinSidebarWidth = isMobile ? '100%' : width;
	$: splitHeight = height ? height : innerHeight - marginTop;

	$: sidebarOnLeft = position === 'left' ? true : false;

	const handleToggleSidebar = () => {
		show = !show;
	};
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="is-flex" style="margin-top: {marginTop}px; height: {splitHeight}px">
	{#if sidebarOnLeft}
		{#if show}
			<div
				class="sidebar-content left"
				style="min-width: {defaultMinSidebarWidth};max-width: {defaultMinSidebarWidth}; border-right: {border};"
				transition:slide={{ axis: 'x' }}
				data-testid="sidebar-content"
			>
				<slot name="content" />
			</div>
		{/if}
		<div class="main-content">
			{#if showToggleButton}
				<button
					class="button toggle-button left {show && isMobile ? 'mobile' : ''} {!show
						? 'open'
						: 'close'}"
					on:click={handleToggleSidebar}
					data-testid="sidebar-button"
				>
					<span class="icon toggle-icon">
						{#if show}
							<span class="material-icons"> first_page </span>
						{:else}
							<span class="material-icons"> last_page </span>
						{/if}
					</span>
				</button>
			{/if}
			<slot name="main" />
		</div>
	{:else}
		<div class="main-content">
			<slot name="main" />
			{#if showToggleButton}
				<div class="toggle-button-right {show && isMobile ? 'mobile' : ''}">
					<button
						class="button toggle-button right {show && isMobile ? 'mobile' : ''} {!show
							? 'open'
							: 'close'}"
						on:click={handleToggleSidebar}
						data-testid="sidebar-button"
					>
						<span class="icon toggle-icon">
							{#if show}
								<span class="material-icons"> last_page </span>
							{:else}
								<span class="material-icons"> first_page </span>
							{/if}
						</span>
					</button>
				</div>
			{/if}
		</div>
		{#if show}
			<div
				class="sidebar-content right"
				style="min-width: {defaultMinSidebarWidth};max-width: {defaultMinSidebarWidth}; border-left: {border};"
				transition:slide={{ axis: 'x' }}
				data-testid="sidebar-content"
			>
				<slot name="content" />
			</div>
		{/if}
	{/if}
</div>

<style global lang="scss">
	.sidebar-content {
		position: relative;
		height: 100%;
	}

	.main-content {
		position: relative;
		height: 100%;
		width: 100%;

		.toggle-button {
			position: absolute;
			top: 6px;
			z-index: 10;

			height: 40px;
			width: 40px;
			border: none;
			outline: none;
			appearance: none;

			&.left {
				&.close {
					left: -48px;
					border-radius: 100px 0px 0px 100px;
				}

				&.open {
					left: -2px;
					border-left: none;
					border-radius: 0px 100px 100px 0px;
					box-shadow: 3px 0px 6px 0px rgba(0, 0, 0, 0.1);
				}
			}

			&.right {
				&.close {
					right: -48px;
					border-radius: 0px 100px 100px 0px;
				}

				&.open {
					right: -2px;
					border-right: none;
					border-radius: 100px 0px 0px 100px;
					box-shadow: -3px 0px 6px 0px rgba(0, 0, 0, 0.1);
				}
			}

			.toggle-icon {
				color: #9e9e9e;

				&:hover {
					color: #757575;
				}
			}
		}
	}
</style>
