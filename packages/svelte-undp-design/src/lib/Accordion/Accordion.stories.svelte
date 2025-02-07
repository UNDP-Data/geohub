<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Accordion from './Accordion.svelte';

	const { Story } = defineMeta({
		title: 'Components/Accordion',
		component: Accordion,
		tags: ['autodocs'],
		argTypes: {
			headerTitle: {
				type: 'string',
				description: 'Header title to be shown in accordion',
				defaultValue: undefined
			},
			isExpanded: {
				type: 'boolean',
				description: 'State of whether accordion is opened or closed.',
				defaultValue: false
			},
			fontSize: {
				type: 'string',
				description: 'Font size of the accordion header title.',
				defaultValue: 'normal',
				control: { type: 'select' },
				options: ['small', 'normal', 'medium']
			},
			headerIcon: {
				type: 'string',
				description: 'Fontawesome icon class name',
				defaultValue: ''
			}
		}
	});
</script>

{#snippet template(args)}
	<Accordion {...args}>
		{#snippet content()}
			<p>Content</p>
		{/snippet}
		{#snippet button()}
			<button class="button is-small">button</button>
		{/snippet}
	</Accordion>
{/snippet}

<Story
	name="Primary"
	args={{
		headerTitle: 'title',
		isExpanded: false,
		headerIcon: '',
		fontSize: 'medium'
	}}
	children={template}
/>

<Story
	name="Icon"
	args={{
		headerTitle: 'title with icon',
		isExpanded: false,
		headerIcon: 'fas fa-circle'
	}}
	children={template}
/>

<Story
	name="Small"
	args={{
		headerTitle: 'small font size',
		isExpanded: false,
		fontSize: 'small'
	}}
	children={template}
/>
