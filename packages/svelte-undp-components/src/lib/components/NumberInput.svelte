<script lang="ts">
	import { isInt } from '$lib/index.js';
	import BigNumber from 'bignumber.js';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let value = 0;
	export let minValue = 0;
	export let maxValue = 99;
	export let step = 1;
	export let size: 'small' | 'normal' | 'medium' | 'large' = 'normal';
	export let readonly = false;

	const handleIncrement = () => {
		if (value < maxValue) {
			value = new BigNumber(value).plus(step).toNumber();
			value = Number(round(value, countDecimals(step)).toFixed(countDecimals(step)));
			dispatch('change', { value });
		}
	};

	const handleDecrement = () => {
		if (value > minValue) {
			value = new BigNumber(value).minus(step).toNumber();
			value = Number(round(value, countDecimals(step)).toFixed(countDecimals(step)));
			dispatch('change', { value });
		}
	};

	const handleValueChanged = (e) => {
		let allowNegative = minValue < 0 || maxValue < 0;

		if (isInt(step)) {
			// interger mode
			let allowedChar = allowNegative ? /[^\d-]/g : /[^\d]/g;
			let numericValue = e.target.value.replace(allowedChar, '');
			if (numericValue.length === 0) {
				numericValue = 0;
			}
			// If the input contains more than one minus sign, keep only the first one
			numericValue = numericValue.replace(/^-+/, '-');
			// If the negative sign immediately follows a digit, remove it
			numericValue = numericValue.replace(/(\d)-+/g, '$1');
			if (numericValue === '-') {
				value = numericValue as unknown as number;
				return;
			} else if (numericValue === '-0') {
				value = '-' as unknown as number;
				return;
			}
			value = new BigNumber(numericValue).toNumber();
		} else {
			// float mode
			let numericValue: string = e.target.value;
			// Remove any non-digit or non-decimal point characters
			let allowedChar = allowNegative ? /[^\d.-]/g : /[^\d.]/g;
			numericValue = numericValue.replace(allowedChar, '');

			// If the input contains more than one minus sign, keep only the first one
			numericValue = numericValue.replace(/^-+/, '-');
			// If the negative sign immediately follows a digit, remove it
			numericValue = numericValue.replace(/(\d)-+/g, '$1');
			if (numericValue === '-') {
				value = numericValue as unknown as number;
				return;
			}

			// Ensure that only one decimal point exists
			const parts = numericValue.split('.');

			// Ensure that only one decimal point exists
			if (parts.length > 2) {
				// If more than one decimal point is present, keep only the first part
				numericValue = parts[0] + '.' + parts.slice(1).join('');
			}

			// Limit the decimal part to two digits
			if (parts.length === 2 && parts[1].length > 2) {
				parts[1] = parts[1].slice(0, 2);
				numericValue = parts.join('.');
			}
			// Ensure that the input is not empty
			if (numericValue.length === 0) {
				numericValue = '0';
			} else if (numericValue.endsWith('.')) {
				value = numericValue as unknown as number;
				return;
			} else if (numericValue === '-0') {
				value = '-' as unknown as number;
				return;
			}
			value = new BigNumber(numericValue).toNumber();
		}
		if (value > maxValue) {
			value = maxValue;
		} else if (value < minValue) {
			value = minValue;
		}
		value = Number(round(value, countDecimals(step)).toFixed(countDecimals(step)));
		dispatch('change', { value });
	};

	// round number based on length of decimal places
	const round = (val: number, exp: number) => {
		if (typeof exp === 'undefined' || +exp === 0) return Math.round(val);

		val = +val;
		exp = +exp;

		if (isNaN(val) || !(typeof exp === 'number' && exp % 1 === 0)) return NaN;

		// Shift
		let val2 = val.toString().split('e');
		val = Math.round(+(val2[0] + 'e' + (val2[1] ? +val2[1] + exp : exp)));

		// Shift back
		val2 = val.toString().split('e');
		return +(val2[0] + 'e' + (val2[1] ? +val2[1] - exp : -exp));
	};

	// number of decimal places
	const countDecimals = (val: number) => {
		if (Math.floor(val) !== val) return val.toString().split('.')[1].length || 0;
		return 0;
	};
</script>

<div class="number-input field has-addons" data-testid="number-input-view-container">
	{#if !readonly}
		<p class="control">
			<button
				class="button is-{size} {size === 'small' ? 'px-4' : ''}"
				on:click={handleDecrement}
				disabled={value <= minValue}
				title="Decrease number"
			>
				<span class="icon is-small">
					<i class="fas fa-minus"></i>
				</span>
			</button>
		</p>
	{/if}
	<p class="control">
		<input
			class="input has-text-centered is-{size}"
			type="text"
			bind:value
			{readonly}
			title="Number Label"
			on:input={handleValueChanged}
		/>
	</p>
	{#if !readonly}
		<p class="control">
			<button
				class="button is-{size} {size === 'small' ? 'px-4' : ''}"
				on:click={handleIncrement}
				disabled={value >= maxValue}
				title="Increase number"
			>
				<span class="icon is-small">
					<i class="fas fa-plus"></i>
				</span>
			</button>
		</p>
	{/if}
</div>

<style lang="scss">
	.number-input {
		.input {
			max-width: 4rem;
			min-width: 45px;
			border-color: hsl(0, 0%, 86%) !important;
		}
	}
</style>
