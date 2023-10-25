<script lang="ts">
	import ColorMapPicker from '$components/util/ColorMapPicker.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let colorMapName: string;
	export let contentWidth: number;

	// the reactive statement below will update map whenever the colormap changes or the legend was switched.
	// quite a tricky business
	// as the colorMapName is two way binded, this means next fucntion is loaded all the time
	// for this reason it makes a lot of sense to consider it a workhorse and do a lot of sanitation ans well

	$: colorMapName, colorMapNameChanged();
	const colorMapNameChanged = () => {
		dispatch('change', {
			colorMapName
		});
	};
</script>

<div class="field">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="label has-text-centered">Colormap</label>
	<div class="control">
		<ColorMapPicker
			bind:colorMapName
			on:colorMapChanged={colorMapNameChanged}
			buttonWidth={contentWidth}
		/>
	</div>
</div>
