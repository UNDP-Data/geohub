<script lang="ts" module>
	import TextInput from '$lib/TextInput/TextInput.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/TextInput',
		component: TextInput,
		tags: ['autodocs'],
		argTypes: {
			placeholder: {
				type: 'string',
				description: 'Placeholder text.',
				defaultValue: 'Placeholder'
			},
			label: {
				type: 'string',
				description: 'Label text.',
				defaultValue: 'Label'
			},
			name: {
				type: 'string',
				description: 'Input name.',
				defaultValue: 'name'
			},
			value: {
				type: 'string',
				description: 'Input value.',
				defaultValue: ''
			},
			disabled: {
				type: 'boolean',
				description: 'Input disabled.',
				defaultValue: false
			}
		}
	});
</script>

<Story
	name="Primary"
	args={{
		placeholder: 'Placeholder',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'text'
	}}
/>

<Story
	name="Calendar"
	args={{
		placeholder: 'Placeholder',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'date'
	}}
/>

<Story
	name="Number"
	args={{
		placeholder: 'Enter search term',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'number'
	}}
/>

<Story
	name="Password"
	args={{
		placeholder: 'Password',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'password'
	}}
/>

<Story
	name="Telephone"
	args={{
		placeholder: '+234 000 000 0000',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'tel'
	}}
/>

<Story
	name="Disabled"
	args={{
		placeholder: 'Placeholder',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: true,
		formType: 'text'
	}}
/>

<Story
	name="Error"
	args={{
		placeholder: 'Placeholder',
		label: 'Label',
		name: 'name',
		value: '',
		disabled: false,
		formType: 'text',
		errorMessage: '*Error: this field is required'
	}}
/>
