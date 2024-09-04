<script lang="ts">
	import { initTippy } from '$lib/util/initTippy.js';
	import { createEventDispatcher } from 'svelte';

	export let selected: number[] = [];
	export let placeholder = 'Select SDG';
	export let isFullWidth = false;
	let isActive = false;

	const dispatch = createEventDispatcher();

	let tippy = initTippy({
		appendTo: document.body,
		maxWidth: 500,
		placement: 'bottom-start',
		arrow: false,
		offset: [0, 0],
		onShow() {
			isActive = true;
		},
		onHide() {
			isActive = false;
		}
	});
	let tooltipContent: HTMLElement;
	let buttonWidth = 0;

	const sdgNumbers = Array.from({ length: 17 }, (_, i) => i + 1);

	const sdgGoals = [
		'No Poverty',
		'Zero Hunger',
		'Good Health and Well-being',
		'Quality Education',
		'Gender Equality',
		'Clean Water and Sanitation',
		'Affordable and Clean Energy',
		'Decent Work and Economic Growth',
		'Industry, Innovation, and Infrastructure',
		'Reduced Inequality',
		'Sustainable Cities and Communities',
		'Responsible Consumption and Production',
		'Climate Action',
		'Life Below Water',
		'Life on Land',
		'Peace, Justice, and Strong Institutions',
		'Partnerships for the Goals'
	];

	const handleSDGSelected = (sdg: number) => {
		if (selected.includes(sdg)) {
			selected = selected.filter((n) => n !== sdg);
		} else {
			selected = [...selected, sdg];
			selected = selected.sort((a, b) => a - b);
		}

		dispatch('select', { sdgs: selected });
	};
</script>

<div
	class="button sdg-button {isFullWidth ? 'is-fullwidth' : ''} px-4"
	aria-haspopup="true"
	aria-controls="dropdown-menu"
	use:tippy={{ content: tooltipContent }}
	bind:clientWidth={buttonWidth}
>
	<span class="button-label wrap-text">
		{#if selected.length === 0}
			{placeholder}
		{:else}
			SDG {selected.join(', ')}
		{/if}
	</span>
	<span class="icon is-small ml-auto">
		<i
			class="fas fa-chevron-down toggle-icon {isActive ? 'is-active' : ''} has-text-primary"
			aria-hidden="true"
		></i>
	</span>
</div>

<div
	bind:this={tooltipContent}
	class="sdg-content tooltip"
	style="width: {(buttonWidth > 500 ? 500 : buttonWidth) - 20}px;"
>
	{#each sdgNumbers as number}
		{@const isSelected = selected.includes(number)}
		<div class="sdg-item py-2 pl-2 pr-4">
			<label class="checkbox is-flex is-align-items-center">
				<span class="icon is-medium">
					<i class="sdg-{number}"></i>
				</span>
				<span class="ml-2 wrap-text sdg-label">
					SDG{number}
					{sdgGoals[number - 1]}
				</span>

				<input
					class="ml-auto"
					type="checkbox"
					checked={isSelected}
					on:change={() => {
						handleSDGSelected(number);
					}}
				/>
			</label>
		</div>
	{/each}
</div>

<style lang="scss">
	.sdg-button {
		border: 1px solid black;
		box-shadow: none;
		min-width: 150px;

		.toggle-icon {
			-webkit-transition: all 0.3s ease;
			-moz-transition: all 0.3s ease;
			-ms-transition: all 0.3s ease;
			-o-transition: all 0.3s ease;
			transition: all 0.3s ease;
			margin-top: 0px;

			&.is-active {
				transform: rotate(-180deg);
				-webkit-transform: rotate(-180deg);
				-moz-transform: rotate(-180deg);
				-ms-transform: rotate(-180deg);
				-o-transform: rotate(-180deg);
				transition: rotateZ(-180deg);
				margin-top: 0px;
				margin-bottom: 5px;
			}
		}
	}

	.sdg-content {
		max-height: 300px;
		overflow-y: auto;

		.sdg-item {
			border-bottom: 1px solid #d4d6d8;
			&:last-child {
				border-bottom: none;
			}

			:hover {
				background-color: #f7f7f7;
			}

			.sdg-label {
				width: 80%;
			}

			input[type='checkbox'] {
				-webkit-appearance: none;
				-moz-appearance: none;
				appearance: none;
				width: 16px;
				height: 16px;
				border: 2px solid #d12800;
				border-radius: 0;

				&:checked {
					background-color: white;
					border-color: #d12800;

					&::before {
						content: '';
						display: block;
						width: 5px;
						height: 10px;
						border: solid #d12800;
						border-width: 0 2px 2px 0;
						transform: rotate(45deg);
						margin: 0px 4px;
					}
				}
			}
		}
	}

	.wrap-text {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		word-break: break-all;
	}

	.tooltip {
		z-index: 10;
		width: fit-content;
	}
</style>
