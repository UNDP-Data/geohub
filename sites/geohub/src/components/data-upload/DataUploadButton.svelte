<script lang="ts">
	export let size: 'large' | 'medium' | 'normal' | 'small' = 'normal';

	const uploadUrl = '/data/upload';
</script>

<a class="button is-primary upload-button my-2 is-{size}" href={uploadUrl}>
	<span class="icon">
		<i class="fa-solid fa-cloud-arrow-up" />
	</span>
	<span>Data upload</span>
</a>
