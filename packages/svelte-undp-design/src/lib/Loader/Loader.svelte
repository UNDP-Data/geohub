<script lang="ts">
	export let size: 'x-small' | 'small' | 'medium' | 'large' = 'medium';
</script>

<div
	class="loader {size === 'small'
		? 'small-loader'
		: size === 'medium'
		? 'medium-loader'
		: 'smallest-loader'}"
	aria-busy="true"
	aria-live="polite"
/>

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
