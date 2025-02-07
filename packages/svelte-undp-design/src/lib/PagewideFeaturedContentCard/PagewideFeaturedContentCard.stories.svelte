<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PagewideFeaturedContentCard from './PagewideFeaturedContentCard.svelte';

	const { Story } = defineMeta({
		title: 'Components/PagewideFeaturedContentCard',
		component: PagewideFeaturedContentCard,
		tags: ['autodocs'],
		argTypes: {
			href: {
				type: 'string'
			},
			title: {
				type: 'string'
			},
			description: {
				type: 'string'
			},
			image: {
				type: 'string'
			},
			buttonText: {
				type: 'string',
				defaultValue: 'READ MORE'
			},
			accent: {
				type: 'string',
				defaultValue: 'global',
				control: { type: 'select' },
				options: ['global', 'yello', 'red', 'green', 'blue']
			},
			tag: {
				type: 'string',
				defaultValue: ''
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		href: '#',
		title: 'Socio-economic impact of COVID-19',
		description:
			'Across the globe, the UN is supporting countries in preparing assessments of the socio-economic impacts of Covid-19. What are these assessments saying and what are the key socio-economic issues caused by the pandemic that the UN and its partners are seeing on the ground?',
		image: '/media/Pagewide.7759e116.jpg',
		tag: 'CONTENT TAG'
	}}
/>
