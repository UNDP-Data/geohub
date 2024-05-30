<script lang="ts">
	import { Button } from '@undp-data/svelte-undp-design';

	export let title: string;
</script>

<div class="a-card is-flex is-flex-direction-column is-gap-1">
	<div class="is-flex is-gap-1">
		<div class="is-flex-grow-1">{title}</div>
		<i class="fa-solid fa-eye" />
		<i class="fa-solid fa-sliders" />
		<i class="fa-solid fa-ellipsis" />
	</div>
	<div class="is-background-light p-3 is-flex is-flex-direction-column is-gap-1">
		<div>CEEI</div>
		<div class="bar"></div>
		<div class="is-flex light-text">
			<div class="is-flex-grow-1">0%</div>
			<div>100%</div>
		</div>
	</div>
	<Button title="CUSTOMIZE DATA" isPrimary={false}></Button>
	<Button title="SIMULATE" isPrimary={false}></Button>
</div>

<style lang="scss">
	.a-card {
		border: 1px solid #d4d6d8;
		padding: 16px;
		font-style: 'ProximaNova';
		font-weight: 700;
	}

	.bar {
		height: 24px;
		background: linear-gradient(90deg, #c598ff, #006eb5);
	}

	.light-text {
		font-weight: 400;
	}
</style>
