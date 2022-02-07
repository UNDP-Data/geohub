<script lang="ts">
    export let value: String = "";
</script>

<input bind:value placeholder="Who are you" />

<p>{value}</p>