<script lang="ts">
    export let size : "small" | "large" = "large";
</script>
<div class="loader {size==='small' ? 'small-loader' : null}" aria-busy="true" aria-live="polite" />

<style lang="scss">
	@use '../css/base-minimal.min.css';
	@use '../css/loader.min.css';

    .small-loader{
      width: 30px;
      height: 30px;
      border: 4px solid #006eb5;
      border-top-color: #edeff0;
    }
</style>
