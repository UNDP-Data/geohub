<script lang="ts">
	interface Props {
		label: string;
		showDelete?: boolean;
		ondelete?: (label: string) => void;
	}

	let { label = $bindable(), showDelete = false, ondelete = () => {} }: Props = $props();

	const handleClick = (e: { preventDefault: () => void }) => {
		if (!showDelete) {
			e.preventDefault();
			return;
		}
		if (ondelete) ondelete(label);
	};
</script>

<button class="chip {showDelete ? 'chip__cross' : ''}" type="button" onclick={handleClick}>
	{label}
</button>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/chips.min.css';

	.chip {
		cursor: default;
		&.chip__cross {
			cursor: pointer;
		}
	}
</style>
