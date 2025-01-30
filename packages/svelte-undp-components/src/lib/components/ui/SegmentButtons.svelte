<script module lang="ts">
	export interface SegmentButton {
		title: string;
		value: string | number | string[] | number[];
		icon?: string;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	interface Props {
		buttons: SegmentButton[];
		selected?: string | number | undefined;
		multiSelect?: boolean;
		selectedItems?: { [key: string | number]: boolean };
		wrap?: boolean;
		size?: 'small' | 'normal' | 'medium' | 'large';
		capitalized?: boolean;
		uppercase?: boolean;
		fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
		activeColor?: string;
		onchange?: (value: string | number, items?: { [key: string | number]: boolean }) => void;
	}

	let {
		buttons = $bindable(),
		selected = $bindable(),
		multiSelect = false,
		selectedItems = $bindable(),
		wrap = false,
		size = 'normal',
		capitalized = false,
		uppercase = false,
		fontWeight = 'normal',
		activeColor = 'is-black',
		onchange = () => {}
	}: Props = $props();

	const handleSelected = (e: SegmentButton) => {
		if (!selectedItems) {
			selectedItems = {};
		}
		if (multiSelect) {
			const value = e.value as string | number;
			selectedItems[value] = selectedItems[value] ? !selectedItems[value] : true;
			if (onchange) onchange(e.value as string | number, selectedItems);
			selectedItems = JSON.parse(JSON.stringify(selectedItems));
		} else {
			selected = e.value as string | number;
			if (onchange) onchange(selected);
		}
	};
</script>

<div class="field has-addons is-flex {wrap ? 'is-flex-wrap-wrap' : ''}">
	{#each buttons as button}
		<p class="control">
			<button
				type="button"
				class="segment-button button is-{size} {(!multiSelect && selected === button.value) ||
				(multiSelect && selectedItems && selectedItems[button.value as number])
					? `${activeColor} is-active`
					: ''}"
				onclick={() => handleSelected(button)}
				disabled={button.disabled ?? false}
			>
				{#if button.icon}
					<span class="icon is-small">
						<i class={button.icon}></i>
					</span>
				{/if}
				<span
					class="has-text-weight-{fontWeight} {capitalized ? 'is-capitalized' : ''} {uppercase
						? 'is-uppercase'
						: ''}">{button.title}</span
				>
			</button>
		</p>
	{/each}
</div>

<style lang="scss">
	.segment-button {
		min-width: 108px;
		height: 40px;
		padding-left: 1.5rem;
		padding-right: 1.5rem;
		border: 1px solid #000;

		&.is-small {
			padding-left: 1rem;
			padding-right: 1rem;
			min-width: fit-content !important;
			height: 34px;
		}
	}
</style>
