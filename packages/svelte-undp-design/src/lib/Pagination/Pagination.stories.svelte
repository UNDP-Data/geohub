<script lang="ts" module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import Pagination from './Pagination.svelte';
	const onclickFn = fn().mockName('onclick');

	const { Story } = defineMeta({
		title: 'Components/Pagination',
		component: Pagination,
		tags: ['autodocs'],
		args: {
			onclick: onclickFn()
		},
		argTypes: {
			totalPages: {
				type: 'number',
				description: 'Total page count of pagination',
				defaultValue: 1
			},
			currentPage: {
				type: 'number',
				description: 'Current page number of pagination',
				defaultValue: 1
			},
			hidden: {
				type: 'boolean',
				description: 'If true, make pagination component hidden',
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="First page"
	args={{
		totalPages: 10,
		currentPage: 1
	}}
/>

<Story
	name="Middle page"
	args={{
		totalPages: 10,
		currentPage: 5
	}}
/>

<Story
	name="Last page"
	args={{
		totalPages: 10,
		currentPage: 10
	}}
/>
