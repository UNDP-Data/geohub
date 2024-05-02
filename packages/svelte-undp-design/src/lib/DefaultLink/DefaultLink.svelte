<script lang="ts">
	export let href: string;
	export let title: string;
	export let target: string;
</script>

<a {href} {title} {target}>
	{title}
	<slot name="content" />
</a>

<style lang="scss">
	@use '../css/base-minimal.min.css';

	a {
		color: inherit !important;
	}
</style>
