<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Card from './Card.svelte';

	const onselectFn = fn().mockName('onselect');

	const { Story } = defineMeta({
		title: 'Components/Card',
		component: Card,
		tags: ['autodocs'],
		args: {
			onselect: onselectFn()
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
			description: {
				control: 'text',
				description: 'Description of content'
			},
			isEmphasize: {
				control: 'boolean',
				description: 'If enabled, emphasize content by accent color.',
				defaultValue: false
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
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'global'
	}}
/>

<Story
	name="Emphasize"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'global',
		isEmphasize: true
	}}
/>

<Story
	name="Accent Yellow"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'yellow'
	}}
/>

<Story
	name="Accent Yellow Emphasized"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'yellow',
		isEmphasize: true
	}}
/>

<Story
	name="Accent Green"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'green'
	}}
/>

<Story
	name="Accent Green Emphasized"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'green',
		isEmphasize: true
	}}
/>

<Story
	name="Accent Red"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'red'
	}}
/>

<Story
	name="Accent Red Emphasized"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'red',
		isEmphasize: true
	}}
/>

<Story
	name="Accent Blue"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'blue'
	}}
/>

<Story
	name="Accent Blue Emphasized"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'blue',
		isEmphasize: true
	}}
/>

<Story
	name="Title With Icon"
	args={{
		linkName: 'READ MORE',
		url: '#',
		title: 'Title of the post goes here and it’s two lines',
		tag: 'CONTENT TAG',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus mollis pharetra ex, a laoreet purus vulputate eget.',
		accent: 'global',
		icon: 'fas fa-home'
	}}
/>
