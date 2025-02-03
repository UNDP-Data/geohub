<script lang="ts">
	import { initTippy, initTooltipTippy } from '$lib/util/initTippy';
	import { DatePicker } from '@undp-data/date-picker-svelte';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	interface Props {
		/**
		 * Maximum date for picker. Default is today.
		 */
		max?: Date;
		/**
		 * Minimum date for picker. Default is 100 years before maximum date
		 */
		min?: Date;
		/**
		 * A selected date currently.
		 * If value is after max date, max date will be default.
		 * If value is before min date, min date will be default.
		 * Otherwise, default is today.
		 */
		value?: Date;
		/**
		 * Enabled dates. All dates will be disabled except them. Default is not specified.
		 * Disabled dates will be ignored if this is used.
		 */
		enabledDates?: Date[];
		/**
		 * Disabled dates. Dates on the array will be disabled.
		 */
		disabledDates?: Date[];
		/**
		 * Date format shown in textbox.
		 * See dayjs documentation. https://day.js.org/docs/en/display/format
		 */
		format?: string;
		/**
		 * Tooltip text for calendar button tooltip
		 */
		tooltip?: string;
		/**
		 * Size of date picker
		 */
		size?: 'small' | 'normal' | 'medium' | 'large';
		/**
		 * Fontawesome class name for button icon
		 */
		icon?: string;
		/**
		 * If true, disable the control
		 */
		disabled?: boolean;
		/**
		 * Width of textbox.
		 */
		width?: number | undefined;

		/**
		 * Event handler for date selection
		 * @param date Date
		 */
		onselect?: (date: Date) => void;
	}

	let {
		max = $bindable(),
		min = $bindable(),
		value = $bindable(),
		enabledDates = $bindable([]),
		disabledDates = $bindable([]),
		format = 'MMMM D, YYYY',
		tooltip = 'Select a date',
		size = 'normal',
		icon = 'fas fa-calendar-days fa-lg',
		disabled = $bindable(false),
		width = $bindable(),
		onselect = () => {}
	}: Props = $props();

	let tippyInstance: { hide: () => void } | undefined;

	const handleSelectDate = (e: { detail: Date }) => {
		value = e.detail;
		if (tippyInstance) {
			tippyInstance.hide();
		}
		if (onselect) onselect(value);
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

	let tooltipContent: HTMLElement | undefined = $state();

	onMount(() => {
		let today = new Date();
		if (!max) {
			max = today;
		}
		if (!min) {
			min = dayjs(max).add(-100, 'year').toDate();
		}
		if (!value) {
			value = dayjs(today).isAfter(max) ? max : dayjs(today).isBefore(min) ? min : today;
		}
	});
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

	<button
		aria-label="date-picker"
		class="panel-button button is-{size} {size === 'small' ? 'px-4' : ''}"
		{disabled}
	>
		<span class="icon is-small">
			<i class={icon}></i>
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
