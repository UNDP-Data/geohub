<script lang="ts">
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
		let numericValue = e.target.value.replace(/[^\d]/g, '');
		if (numericValue.length === 0) {
			numericValue = 0;
		}
		value = new BigNumber(numericValue).toNumber();
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
				class="button is-{size}"
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
				class="button is-{size}"
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
			border-color: hsl(0, 0%, 86%);
		}
	}
</style>
