<script lang="ts">
	import { ColorMapPicker } from '@undp-data/svelte-undp-components';
	import { reloadAdmin } from '../utils/adminLayer';
	import { colorMap } from '../stores';

	const colorPickerChangeHandler = (cmapName: string) => {
		colorMap.update(() => {
			return {
				value: cmapName,
				isReversed: cmapName.indexOf('_r') !== -1
			};
		});
		reloadAdmin();
	};
</script>

<div class="mt-2 p-4 has-background-light">
	<p class="mb-2">Electricity access</p>
	<ColorMapPicker colorMapName={$colorMap.value} onchange={colorPickerChangeHandler} />
	<!--	<label class="checkbox mt-2">-->
	<!--		<input type="checkbox" onchange={showLabelsHandler} checked={showMapLabels} />-->
	<!--		Show Labels-->
	<!--	</label>-->
</div>
