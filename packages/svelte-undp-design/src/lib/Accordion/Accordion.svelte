<script lang="ts">
	interface Props {
		headerTitle: string;
		isExpanded?: boolean;
		fontSize?: 'small' | 'normal' | 'medium';
		headerIcon?: string;
		button?: import('svelte').Snippet;
		content?: import('svelte').Snippet;
	}

	let {
		headerTitle,
		isExpanded = $bindable(false),
		fontSize = 'normal',
		headerIcon = '',
		button,
		content
	}: Props = $props();
</script>

<ul class="accordion" aria-label="accordion">
	<li>
		<div class="accordion-title">
			<button
				tabindex="0"
				aria-expanded={isExpanded}
				class={`accordion-button ${isExpanded ? 'accordion--active' : ''}`}
				onclick={() => {
					isExpanded = !isExpanded;
				}}
			>
				<p
					class="accordion-header"
					style="font-size:{fontSize === 'small' ? 0.75 : fontSize === 'medium' ? 1.5 : 1}rem"
				>
					{#if headerIcon}
						<i class={headerIcon}></i>
					{/if}
					{headerTitle}
				</p>
			</button>
			<div style="width:10%">
				{@render button?.()}
			</div>
		</div>
		<div
			class={!isExpanded ? 'accordion__panel' : 'accordion--active'}
			aria-hidden={!isExpanded}
			role="region"
		>
			<div class="accordion-content">{@render content?.()}</div>
		</div>
	</li>
</ul>

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/accordion.min.css';

	.accordion {
		padding: 5px 10px 5px 5px;
		.accordion-title {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			padding-left: 0.6rem;

			.accordion-button {
				padding-top: 1rem;
				padding-bottom: 1rem;
				width: 90%;
			}

			.accordion-header {
				padding-left: 2rem;
				padding-right: 0;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				text-transform: capitalize;
				text-align: left;
				width: 90%;
			}
		}

		li button:before {
			content: '';
			margin-left: 0;
			position: absolute;
			left: 0;
			top: auto;
		}

		.accordion-content {
			cursor: default;
		}
	}
</style>
