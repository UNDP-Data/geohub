<script lang="ts">
	export let title: string;
	export let linkName: string;
	export let href: string;
</script>

<section class="hero has-background-grey-darker mt-6">
	<div class="hero-body has-text-centered">
		<h2 class="title is-2 mb-4 has-text-white has-text-weight-bold">{title}</h2>

		<p class="is-size-5 has-text-white mx-auto mb-4 max-width">
			<slot />
		</p>

		<div class="mt-4">
			<a class="button is-primary is-uppercase has-text-weight-bold" {href}>
				<span>{linkName}</span>
			</a>
		</div>
	</div>
</section>
