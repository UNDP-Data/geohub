<script lang="ts" module>
	import type { CarouselContent } from '$lib/interfaces';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FluidCarousel from './FluidCarousel.svelte';

	const { Story } = defineMeta({
		title: 'Components/FluidCarousel',
		component: FluidCarousel,
		tags: ['autodocs'],
		argTypes: {
			contents: {
				// type: 'string',
				description: 'The arraylist of carousel objects to be shown',
				defaultValue: undefined
			}
		}
	});

	const contents: CarouselContent[] = [
		{
			tag: 'Blog post',
			imageUrl: 'media/fluid-carousel-img.jpg',
			title: 'Entry and Exit Points: Violent Extremism in South-East Asia',
			description:
				'This study summarizes four complementary in-depth papers that explore the localized…',
			linkName: 'Read More',
			linkUrl: '#'
		},
		{
			tag: 'Blog post',
			imageUrl: 'media/fluid-carousel-img.jpg',
			title: 'Entry and Exit Points: Violent Extremism in South-East Asia',
			description:
				'This study summarizes four complementary in-depth papers that explore the localized…',
			linkName: 'Read More',
			linkUrl: '#'
		},
		{
			tag: 'Blog post',
			imageUrl: 'media/fluid-carousel-img.jpg',
			title: 'Entry and Exit Points: Violent Extremism in South-East Asia',
			description:
				'This study summarizes four complementary in-depth papers that explore the localized…',
			linkName: 'Read More',
			linkUrl: '#'
		}
	];
</script>

<Story
	name="Primary"
	args={{
		contents: contents
	}}
/>
