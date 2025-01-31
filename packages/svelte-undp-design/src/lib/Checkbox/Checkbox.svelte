<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';

	interface Props {
		label: string;
		checked?: boolean;
		disabled?: boolean;
		onclick?: () => void;
	}

	let { label, checked = $bindable(false), disabled = false, onclick = () => {} }: Props = $props();

	let labelId = uuidv4();

	const handleChecked = () => {
		if (onclick) onclick();
	};
</script>

<div class="form-check vertical-align {disabled ? 'has-text-grey-light' : ''}">
	<input
		{disabled}
		data-testid="checkbox"
		id={labelId}
		type="checkbox"
		bind:checked
		onclick={handleChecked}
	/>
	<label for={labelId}>
		{label}
	</label>
</div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/checkbox.min.css';

	input[type='checkbox']:disabled {
		opacity: 0.5;
	}

	.vertical-align {
		align-content: center;
	}
</style>
