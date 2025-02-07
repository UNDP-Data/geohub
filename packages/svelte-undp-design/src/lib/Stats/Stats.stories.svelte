<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Stats from './Stats.svelte';

	const { Story } = defineMeta({
		title: 'Components/Stats',
		component: Stats,
		tags: ['autodocs'],
		argTypes: {
			card: {
				description: 'StatsCard object. Stats information to show',
				defaultValue: undefined
			},
			size: {
				type: 'string',
				description: 'Stats card size.',
				defaultValue: 'medium',
				control: { type: 'select' },
				options: ['small', 'medium', 'large', 'x-large']
			},
			accent: {
				type: 'string',
				description: 'Accent color',
				defaultValue: 'global',
				control: { type: 'select' },
				options: ['global', 'yellow', 'red', 'green', 'blue']
			}
		}
	});
</script>

<Story
	name="Small"
	args={{
		card: {
			stat: 35,
			title: 'Percents, with very long subheader, spanning several lines',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		},
		size: 'small'
	}}
/>

<Story
	name="Medium"
	args={{
		card: {
			stat: 35,
			title: 'Percents, with very long subheader, spanning several lines',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		},
		size: 'medium'
	}}
/>

<Story
	name="Large"
	args={{
		card: {
			stat: 35,
			title: 'Percents, with very long subheader, spanning several lines',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		},
		size: 'large'
	}}
/>

<Story
	name="Xlarge"
	args={{
		card: {
			stat: 35,
			title: 'Percents, with very long subheader, spanning several lines',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		},
		size: 'x-large'
	}}
/>

<Story
	name="Yellow"
	args={{
		card: {
			stat: 35,
			title: 'Percents, with very long subheader, spanning several lines',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		},
		size: 'medium',
		accent: 'yellow'
	}}
/>

<Story
	name="Green"
	args={{
		card: {
			stat: 35,
			title: 'Percents, with very long subheader, spanning several lines',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		},
		size: 'medium',
		accent: 'green'
	}}
/>

<Story
	name="Red"
	args={{
		card: {
			stat: 35,
			title: 'Percents, with very long subheader, spanning several lines',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		},
		size: 'medium',
		accent: 'red'
	}}
/>

<Story
	name="Blue"
	args={{
		card: {
			stat: 35,
			title: 'Percents, with very long subheader, spanning several lines',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
		},
		size: 'medium',
		accent: 'blue'
	}}
/>
