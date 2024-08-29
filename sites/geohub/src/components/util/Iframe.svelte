<script lang="ts">
	export let id: string;
	export let title: string;
	export let url: string;
	export let height = 500;
</script>

<iframe {title} {id} frameborder="0" src={url} width="100%" {height}></iframe>
