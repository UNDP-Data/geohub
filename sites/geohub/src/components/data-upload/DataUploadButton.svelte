<script lang="ts">
	import { goto } from '$app/navigation';

	const gotoUploadPage = () => {
		goto(`/data/upload`);
	};
</script>

<button class="button is-primary upload-button my-2" on:click={gotoUploadPage}>
	<span class="icon">
		<i class="fa-solid fa-cloud-arrow-up" />
	</span>
	<span>Data upload</span>
</button>
