<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ImageUploader from './ImageUploader.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/ImageUploader',
		component: ImageUploader,
		tags: ['autodocs']
	});
</script>

<Story name="Default" args={{}} />

<Story
	name="Default image"
	args={{
		dataUrl: 'https://geohub.data.undp.org/assets/undp-images/undp-logo-blue.svg'
	}}
/>
