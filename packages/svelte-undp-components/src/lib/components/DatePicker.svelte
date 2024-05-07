<script lang="ts">
	import { initTippy, initTooltipTippy } from '$lib/util/initTippy.js';
	import { DatePicker } from '@undp-data/date-picker-svelte';
	import dayjs from 'dayjs';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	/**
	 * Maximum date for picker. Default is today.
	 */
	export let max: Date = new Date();
	/**
	 * Minimum date for picker. Default is 100 years before maximum date
	 */
	export let min: Date = dayjs(max).add(-100, 'year').toDate();

	let today = new Date();

	/**
	 * A selected date currently.
	 * If value is after max date, max date will be default.
	 * If value is before min date, min date will be default.
	 * Otherwise, default is today.
	 */
	export let value: Date = dayjs(today).isAfter(max)
		? max
		: dayjs(today).isBefore(min)
			? min
			: today;

	/**
	 * Enabled dates. All dates will be disabled except them. Default is not specified.
	 * Disabled dates will be ignored if this is used.
	 */
	export let enabledDates: Date[] = [];

	/**
	 * Disabled dates. Dates on the array will be disabled.
	 */
	export let disabledDates: Date[] = [];

	/**
	 * Date format shown in textbox.
	 * See dayjs documentation. https://day.js.org/docs/en/display/format
	 */
	export let format = 'MMMM D, YYYY';

	/**
	 * Tooltip text for calendar button tooltip
	 */
	export let tooltip = 'Select a date';

	/**
	 * Size of date picker
	 */
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'normal';

	/**
	 * Fontawesome class name for button icon
	 */
	export let icon = 'fas fa-calendar-days fa-lg';

	/**
	 * If true, disable the control
	 */
	export let disabled = false;

	/**
	 * Width of textbox.
	 */
	export let width: number | undefined = undefined;

	let tippyInstance: { hide: () => void } | undefined;

	const handleSelectDate = (e: { detail: Date }) => {
		value = e.detail;
		if (tippyInstance) {
			tippyInstance.hide();
		}
		dispatch('select', {
			date: value
		});
	};

	const tippyTooltip = initTooltipTippy();
	const tippy = initTippy({
		appendTo: document.body,
		placement: 'bottom',
		theme: 'transparent',
		arrow: false,
		offset: [0, 0],
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		onShow(instance) {
			tippyInstance = instance;
		},
		onHide() {
			tippyInstance = undefined;
		}
	});

	let tooltipContent: HTMLElement;
</script>

<div
	class="date-picker is-flex"
	use:tippy={{ content: tooltipContent }}
	use:tippyTooltip={{ content: tooltip }}
>
	<input
		class="input date-input is-{size}"
		style={width ? `width:${width}px;` : ''}
		type="text"
		value={value ? dayjs(value).format(format) : ''}
		readonly
		{disabled}
	/>

	<button class="panel-button button is-{size} {size === 'small' ? 'px-4' : ''}" {disabled}>
		<span class="icon is-small">
			<i class={icon} />
		</span>
	</button>
</div>

<div class="tooltip" data-testid="tooltip" bind:this={tooltipContent}>
	<DatePicker
		bind:value
		bind:min
		bind:max
		{enabledDates}
		{disabledDates}
		on:select={handleSelectDate}
	/>
</div>

<style lang="scss">
	.date-picker {
		width: fit-content;

		.date-input {
			cursor: pointer;
			width: fit-content;
			max-width: 200px;
			border-radius: 0;
			&:disabled {
				border: 1px solid black;
				cursor: no-drop;
			}
		}

		.panel-button {
			border: 1px solid black;
			border-left: none;
			border-radius: 0;
		}
	}

	:global(.tippy-box[data-theme='transparent']) {
		background-color: transparent;
		color: transparent;
	}
</style>
