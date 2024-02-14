<script lang="ts">
	import { goto } from '$app/navigation';

	export let size: 'large' | 'medium' | 'normal' | 'small' = 'normal';

	const uploadUrl = '/data/upload';
	const gotToUpload = () => {
		goto(uploadUrl, {
			invalidateAll: true
		});
	};
</script>

<button
	class="button is-primary is-uppercase has-text-weight-bold upload-button my-2 is-{size}"
	on:click={gotToUpload}
>
	Data upload
</button>
