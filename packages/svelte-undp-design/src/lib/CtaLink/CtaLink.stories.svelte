<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import CtaLink from './CtaLink.svelte';
	const onclickFn = fn().mockName('onclick');

	const { Story } = defineMeta({
		title: 'Components/CtaLink',
		component: CtaLink,
		tags: ['autodocs'],
		args: {
			onclick: onclickFn()
		},
		argTypes: {
			label: {
				type: 'string',
				description: 'label to be shown in link',
				defaultValue: undefined
			},
			isArrow: {
				type: 'boolean',
				description: 'If enabled, arrow will be shown in link',
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		label: 'Read more',
		isArrow: true
	}}
/>

<Story
	name="Arrow"
	args={{
		label: 'Read more',
		isArrow: true
	}}
/>

<Story
	name="Without Arrow"
	args={{
		label: 'Read more',
		isArrow: false
	}}
/>

<Story
	name="With Href"
	args={{
		label: 'Read more',
		isArrow: false,
		href: '#'
	}}
/>
