<script lang="ts">
	interface Props {
		href: string;
		title: string;
		target?: string;
		content?: import('svelte').Snippet;
	}

	let { href, title, target = '_blank', content }: Props = $props();
</script>

<a {href} {title} {target}>
	{title}
	{@render content?.()}
</a>

<style lang="scss">
	@use '../css/base-minimal.min.css';

	a {
		color: inherit !important;
	}
</style>
