<script lang="ts">
	interface Props {
		size?: 'small' | 'medium' | 'large';
	}

	let { size = 'medium' }: Props = $props();
</script>

<div
	class="loader {size === 'small' ? 'small-loader' : size === 'medium' ? 'medium-loader' : ''}"
	aria-busy="true"
	aria-live="polite"
	data-testid="loader"
></div>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/loader.min.css';

	.small-loader {
		width: 30px;
		height: 30px;
		border: 4px solid #006eb5;
		border-top-color: #edeff0;
	}
	.medium-loader {
		width: 50px;
		height: 50px;
		border: 4px solid #006eb5;
		border-top-color: #edeff0;
	}
	.smallest-loader {
		width: 20px;
		height: 20px;
		border: 4px solid #006eb5;
		border-top-color: #edeff0;
	}
</style>
