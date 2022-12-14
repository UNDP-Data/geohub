<script lang="ts">
	import { CardWithImage } from '$lib';
</script>

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
