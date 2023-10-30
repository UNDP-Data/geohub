<div class="row columns is-vcentered m-0 is-mobile">
	<div class="column is-4-desktop">
		<p class="is-size-6 has-text-centered has-text-weight-bold">Name</p>
	</div>
	<div class="column is-1 hidden-mobile">
		<p class="is-size-6 has-text-centered has-text-weight-bold">SDG</p>
	</div>
	<div class="column is-2 hidden-mobile">
		<p class="is-size-6 has-text-centered has-text-weight-bold">License</p>
	</div>
	<div class="column is-2 hidden-mobile">
		<p class="is-size-6 has-text-centered has-text-weight-bold">Created at</p>
	</div>
	<div class="column is-2 hidden-mobile">
		<p class="is-size-6 has-text-centered has-text-weight-bold">Updated at</p>
	</div>

	<div class="column is-1">
		<p></p>
	</div>
</div>

<style lang="scss">
	.row {
		border-top: 1px solid gray;
		border-bottom: 1px solid gray;
	}

	.hidden-mobile {
		display: block;
		@media (max-width: 48em) {
			display: none;
		}
	}
</style>
