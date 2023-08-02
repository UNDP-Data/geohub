<script lang="ts">
	export let title: string;
</script>

<div class="style-editing-box">
	<span class="box-title" data-testid="box-title">{title}</span>
	<p>
		<slot />
	</p>
</div>

<style lang="scss">
	.style-editing-box {
		position: relative;
		margin: 2em 0;
		padding: 1em 1em 0.5em 1em;
		border: solid 0.5px #1c1c1c;
		border-radius: 8px;
		.box-title {
			position: absolute;
			display: inline-block;
			top: -5px;
			left: 7px;
			padding: 0 6px;
			line-height: 1;
			font-size: 12px;
			background: #fff;
			color: rgb(1, 1, 1, 0.6);
			font-weight: normal;
		}
	}
</style>
