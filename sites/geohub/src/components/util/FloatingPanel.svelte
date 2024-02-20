<script lang="ts">
	import { clean, handleEnterKey } from '$lib/helper';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let title: string;
	export let isExpanded = true;

	const handleClose = () => {
		dispatch('close');
	};
</script>

<div class="floating-panel">
	<div class="header has-background-light is-flex is-align-items-center px-2">
		<div
			class="header-title is-size-6"
			role="button"
			tabindex="0"
			on:click={() => {
				isExpanded = !isExpanded;
			}}
			on:keydown={handleEnterKey}
		>
			{clean(title)}
		</div>
		<div class="header-buttons pl-2">
			<button
				class="button px-0 chevron-button {isExpanded ? 'is-expanded' : ''}"
				on:click={() => {
					isExpanded = !isExpanded;
				}}
			>
				<span class="icon is-small">
					<i class="fa-solid fa-chevron-down"></i>
				</span>
			</button>
			<button class="button pl-2" on:click={handleClose}>
				<span class="icon is-small">
					<i class="fas fa-xmark"></i>
				</span>
			</button>
		</div>
	</div>
	<div class="contents" hidden={!isExpanded}>
		<slot />
	</div>
</div>

<style lang="scss">
	.floating-panel {
		background-color: white;

		.header {
			cursor: pointer;

			.header-title {
				width: 100%;
				overflow: hidden;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				word-break: break-all;
			}

			.header-buttons {
				margin-left: auto;
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 5px;

				.chevron-button {
					-webkit-transition: all 0.3s ease;
					-moz-transition: all 0.3s ease;
					-ms-transition: all 0.3s ease;
					-o-transition: all 0.3s ease;
					transition: all 0.3s ease;

					&.is-expanded {
						transform: rotate(-180deg);
						-webkit-transform: rotate(-180deg);
						-moz-transform: rotate(-180deg);
						-ms-transform: rotate(-180deg);
						-o-transform: rotate(-180deg);
						transition: rotateZ(-180deg);
					}
				}
				.button {
					border: none;
					background: transparent;
				}
			}
		}
	}
</style>
