<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="container mt-6 m-4">
	<p class="title is-4">Whoops! Something wrong!</p>
	<p class="subtitle is-5 has-text-justified pt-4">{$page.error.message}</p>
	<p class="subtitle is-5 has-text-justified">Please contact administrator.</p>
</div>
