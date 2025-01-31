<script lang="ts">
	interface Props {
		placeholder: string;
		label: string;
		name: string;
		value: string;
		disabled?: boolean;
		formType?: 'text' | 'tel' | 'password' | 'number' | 'date';
		errorMessage?: string;
	}

	let {
		placeholder,
		label,
		name,
		value = $bindable(),
		disabled = false,
		formType = 'text',
		errorMessage = ''
	}: Props = $props();
</script>

<label class={disabled ? 'disabled' : ''} for={formType}>{label}</label>
{#if formType === 'tel'}
	<input
		class="empty {disabled ? 'disabled' : ''} {errorMessage ? 'error' : ''}"
		type="tel"
		bind:value
		{placeholder}
		{name}
		id={formType}
		{disabled}
	/>
{:else if formType === 'password'}
	<input
		class="empty {disabled ? 'disabled' : ''}{errorMessage ? 'error' : ''}"
		type="password"
		bind:value
		{placeholder}
		{name}
		id={formType}
		{disabled}
	/>
{:else if formType === 'number'}
	<input
		class="empty {disabled ? 'disabled' : ''}{errorMessage ? 'error' : ''}"
		type="number"
		bind:value
		{placeholder}
		{name}
		id={formType}
		{disabled}
	/>
{:else if formType === 'date'}
	<input
		class="empty {disabled ? 'disabled' : ''}{errorMessage ? 'error' : ''}"
		type="date"
		bind:value
		{placeholder}
		{name}
		id={formType}
		{disabled}
	/>
{:else}
	<input
		class="empty {disabled ? 'disabled' : ''}{errorMessage ? 'error' : ''}"
		type="text"
		bind:value
		{placeholder}
		{name}
		id={formType}
		{disabled}
	/>
{/if}
{#if errorMessage}
	<p class="error">*Error: this field is required</p>
{/if}

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/input-fields.min.css';
</style>
