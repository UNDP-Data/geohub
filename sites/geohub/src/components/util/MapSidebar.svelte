<script lang="ts">
	import type { SidebarPosition } from '$lib/types';
	import { slide } from 'svelte/transition';

	export let isMenuShown = true;
	export let sideBarPosition: SidebarPosition = 'left';
	export let sideBarWidth = '360px';
	export let marginTop = 0;

	let innerWidth: number;
	let innerHeight: number;
	$: isMobile = innerWidth < 768 ? true : false;
	$: defaultMinSidebarWidth = isMobile ? '100%' : sideBarWidth;
	$: splitHeight = innerHeight - marginTop;

	let sidebarOnLeft = sideBarPosition === 'left' ? true : false;

	const handleToggleSidebar = () => {
		isMenuShown = !isMenuShown;
	};
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="is-flex" style="margin-top: {marginTop}px; height: {splitHeight}px">
	{#if sidebarOnLeft}
		{#if isMenuShown}
			<div
				class="sidebar-content left"
				style="min-width: {defaultMinSidebarWidth};max-width: {defaultMinSidebarWidth};"
				transition:slide={{ axis: 'x' }}
			>
				<slot name="content" />
			</div>
		{/if}
		<div class="map-content">
			<button
				class="button toggle-button left {isMenuShown && isMobile ? 'mobile' : ''} "
				on:click={handleToggleSidebar}
			>
				<span class="icon {isMenuShown ? 'open' : 'close'}">
					{#if isMenuShown}
						<i class="fa-solid fa-caret-left fa-lg"></i>
					{:else}
						<i class="fa-solid fa-caret-right fa-lg"></i>
					{/if}
				</span>
			</button>
			<slot name="map" />
		</div>
	{:else}
		<div class="map-content">
			<slot name="map" />
			<div class="toggle-button-right {isMenuShown && isMobile ? 'mobile' : ''}">
				<button
					class="button toggle-button right {isMenuShown && isMobile ? 'mobile' : ''}"
					on:click={handleToggleSidebar}
				>
					<span class="icon {isMenuShown ? 'open' : 'close'}">
						{#if isMenuShown}
							<i class="fa-solid fa-caret-right fa-lg"></i>
						{:else}
							<i class="fa-solid fa-caret-left fa-lg"></i>
						{/if}
					</span>
				</button>
			</div>
		</div>
		{#if isMenuShown}
			<div
				class="sidebar-content right"
				style="min-width: {defaultMinSidebarWidth};max-width: {defaultMinSidebarWidth};"
				transition:slide={{ axis: 'x' }}
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

		&.left {
			border-right: 1px solid #1c1c1c;
		}

		&.right {
			border-left: 1px solid #1c1c1c;
		}
	}

	.map-content {
		position: relative;
		height: 100%;
		width: 100%;
	}

	@-webkit-keyframes left2right {
		0% {
			-webkit-transform: translateX(-5px);
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			-webkit-transform: translateX(5px);
			opacity: 0;
		}
	}
	@keyframes left2right {
		0% {
			transform: translateX(-5px);
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			transform: translateX(5px);
			opacity: 0;
		}
	}

	@-webkit-keyframes right2left {
		0% {
			-webkit-transform: translateX(5px);
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			-webkit-transform: translateX(-5px);
			opacity: 0;
		}
	}
	@keyframes right2left {
		0% {
			transform: translateX(5px);
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			transform: translateX(-5px);
			opacity: 0;
		}
	}

	.toggle-button {
		position: absolute;
		transform: translateY(-50%);
		top: 50%;
		z-index: 10;

		height: 50px;
		width: 15px;
		border: 1px solid #1c1c1c;

		&.left {
			border-left: none;
			border-radius: 0 5px 5px 0;
			left: -2px;

			&.mobile {
				border-left: 1px solid #1c1c1c;
				border-radius: 5px 0 0 5px;

				left: -26px;
			}

			span {
				-webkit-animation: right2left 1.5s infinite;
				animation: right2left 1.5s infinite;

				&.close {
					-webkit-animation: left2right 1.5s infinite;
					animation: left2right 1.5s infinite;
				}
			}
		}

		&.right {
			border-right: none;
			border-radius: 5px 0 0 5px;
			right: -2px;

			&.mobile {
				border-right: 1px solid #1c1c1c;
				border-radius: 0 5px 5px 0;

				right: -26px;
			}

			span {
				-webkit-animation: left2right 1.5s infinite;
				animation: left2right 1.5s infinite;

				&.close {
					-webkit-animation: right2left 1.5s infinite;
					animation: right2left 1.5s infinite;
				}
			}
		}
	}
</style>
