<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';

	/**
	 * It will redirect to this page if there is no previous page info.
	 */
	export let defaultLink: string;

	/**
	 * Title of the link
	 */
	export let title = 'Back to previous page';

	// preserve previous page URL
	let previousPage: string;
	afterNavigate(({ from }) => {
		if (from?.url) {
			const target = `${from?.url.pathname}`;
			const current = `${$page.url.pathname}`;
			if (target !== current) {
				previousPage = `${from.url.pathname}${from.url.search}${from.url.hash}`;
			}
		}
	});
</script>

<a type="button" class="button is-rounded is-link" href={previousPage ?? defaultLink}>
	<span class="icon">
		<i class="fa-solid fa-circle-chevron-left fa-lg"></i>
	</span>
	<span>{title}</span>
</a>
