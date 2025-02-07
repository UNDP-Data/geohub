<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import CardWithImage from './CardWithImage.svelte';
	const onclickFn = fn().mockName('onclick');

	const { Story } = defineMeta({
		title: 'Components/CardWithImage',
		component: CardWithImage,
		tags: ['autodocs'],
		args: {
			onclick: onclickFn()
		},
		argTypes: {
			linkName: {
				control: 'text',
				description: 'Name of link',
				defaultValue: 'READ MORE'
			},
			url: {
				control: 'text',
				description: 'URL to link',
				defaultValue: '#'
			},
			title: {
				control: 'text',
				description: 'Title of the post goes here and it’s two lines'
			},
			tag: {
				control: 'text',
				description: 'Content tag'
			},
			image: {
				control: 'text',
				description: 'URL for the image'
			},
			width: {
				control: 'number',
				description: 'Width of image'
			},
			height: {
				control: 'number',
				description: 'Height of image'
			},
			accent: {
				control: 'select',
				options: ['global', 'yellow', 'green', 'red', 'blue'],
				description: 'accent color. global, yellow, red, blue, green is available',
				defaultValue: 'global'
			},
			icon: {
				type: 'string',
				description: 'Optional. Fontawesome icon class name.'
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		image: '/media/card-thumbnail.jpg',
		accent: 'global',
		width: 250,
		height: 150
	}}
/>

<Story
	name="Yellow"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		image: '/media/card-thumbnail.jpg',
		accent: 'yellow',
		width: 250,
		height: 150
	}}
/>

<Story
	name="Green"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		image: '/media/card-thumbnail.jpg',
		accent: 'green',
		width: 250,
		height: 150
	}}
/>

<Story
	name="Red"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		image: '/media/card-thumbnail.jpg',
		accent: 'red',
		width: 250,
		height: 150
	}}
/>

<Story
	name="Blue"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		image: '/media/card-thumbnail.jpg',
		accent: 'blue',
		width: 250,
		height: 150
	}}
/>

<Story
	name="Title With Icon"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		image: '/media/card-thumbnail.jpg',
		accent: 'global',
		width: 250,
		height: 150,
		icon: 'fas fa-user'
	}}
/>
