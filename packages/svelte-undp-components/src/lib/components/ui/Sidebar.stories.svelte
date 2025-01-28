<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Sidebar from './Sidebar.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Sidebar',
		component: Sidebar,
		argTypes: {
			position: {
				control: 'select',
				options: ['left', 'right'],
				defaultValue: 'left'
			}
		}
	});
</script>

{#snippet template(args)}
	<Sidebar {...args}>
		{#snippet content()}
			<div>sidebar content</div>
		{/snippet}
		{#snippet main()}
			<div>main content</div>
		{/snippet}
	</Sidebar>
{/snippet}

<Story
	name="Left sidebar"
	args={{ position: 'left', height: 300 }}
	tags={['autodocs']}
	children={template}
/>

<Story
	name="Right sidebar"
	args={{ position: 'right', height: 300 }}
	tags={['autodocs']}
	children={template}
/>

<Story
	name="Hide border"
	args={{ position: 'left', border: 'none', height: 300 }}
	tags={['autodocs']}
	children={template}
/>

<Story
	name="Hide toggle button"
	args={{ position: 'left', showToggleButton: false, height: 300 }}
	tags={['autodocs']}
	children={template}
/>

<Story
	name="Hide sidebar as default"
	args={{ position: 'left', show: false, height: 300 }}
	tags={['autodocs']}
	children={template}
/>
