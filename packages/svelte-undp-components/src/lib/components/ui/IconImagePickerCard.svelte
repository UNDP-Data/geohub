<script lang="ts">
	import { clean, handleEnterKey } from '$lib/util';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	interface Props {
		alt: string;
		src: string;
		isSelected?: boolean;
		withinForm?: boolean;
	}

	let {
		alt = $bindable(),
		src = $bindable(),
		isSelected = $bindable(false),
		withinForm = $bindable(false)
	}: Props = $props();

	const handleIconSelect = () => {
		dispatch('select', { alt, src });
	};
</script>

<div
	role="button"
	tabindex="0"
	onclick={handleIconSelect}
	onkeydown={handleEnterKey}
	class="card"
	data-testid="icon-image-picker-card-container"
>
	<div class="card-content">
		<div class="media is-flex is-justify-content-center">
			<figure
				class={`image is-24x24 ${isSelected ? '' : 'is-clickable'}`}
				data-testid="icon-figure"
			>
				{#if withinForm}
					<img
						data-testid="icon-image"
						{src}
						alt={clean(alt)}
						title={clean(alt)}
						style="width:24px; height:24px; color: white;"
					/>
				{:else}
					<input
						data-testid="icon-image"
						type="image"
						{src}
						alt={clean(alt)}
						title={clean(alt)}
						style="width:24px; height:24px; color: white;"
						value={alt}
					/>
				{/if}
			</figure>
		</div>
		<div class="content is-size-7 columns is-gapless" style="padding-top: 5px;">
			<div class="column is-flex is-justify-content-center sprite-image-title" title={alt}>
				{clean(alt)}
			</div>
			{#if isSelected}
				<div class="selected" title="Icon Selected">
					<i class="fa-solid fa-check"></i>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.card {
		cursor: pointer;

		.card-content {
			padding: 5px;

			.media {
				margin: 0;
			}

			.sprite-image-title {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 75px;
				width: 75px;
			}

			.selected {
				color: hsl(141, 53%, 53%);
				position: absolute;
				right: 5px;
				top: 3px;
			}
		}
	}
</style>
