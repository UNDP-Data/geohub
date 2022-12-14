<script lang="ts">
	import { CardWithImage, Header } from '$lib';

	let headerHeight: number;
</script>

<Header
	region="REGION"
	siteTitle="Site Title"
	logoUrl="assets/undp-logo-blue.svg"
	bind:height={headerHeight}
>
	<div slot="menu-buttons">
		<div role="button" aria-label="Layer panel" class="menu-button" tabindex="0">
			<span class="icon">
				<i class="fa-solid fa-bars fa-xl" style="color:#006eb5" />
			</span>
		</div>
	</div>
</Header>

<div class="contents" style="margin-top: {headerHeight}px;">
	<h1>Welcome to svelte UNDP design project project</h1>

	<h2>Card with image</h2>

	<CardWithImage linkName="READ MORE">
		<div slot="title">
			<h6>content tag</h6>
		</div>
		<div slot="image">
			<img src="media/card-thumbnail.jpg" alt="media/card-thumbnail.jpg" />
		</div>
		<div slot="description">
			<h5>Title of the post goes here and it’s two lines</h5>
		</div>
	</CardWithImage>
</div>

<style lang="scss">
	@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css';
</style>
