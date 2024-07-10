<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { hrea } from '../stores';

	const dispatch = createEventDispatcher();

	export let dashboardSelections: {
		show: boolean;
		mapIcon: string;
		mapIconAlt: string;
		text: string;
	}[];
	const hideIntro = () => {
		dispatch('click');
	};

	$: disabled = !($hrea?.length > 0);

	let showDialog = false;
	const modalHandler = () => {
		showDialog = !showDialog;
	};
</script>

<p class="is-size-6 mb-4 has-text-justified">
	The <b>Affordable and clean energy</b> dashboard helps identify vulnerable areas in the world that
	have limited or no access to energy.
</p>
<p class="is-size-6 mb-4 has-text-justified">
	By comparing electricity data with wealth data, suggestions can be made regarding which areas are
	most at risk and in need of improvements in electricity infrastructure.
</p>
<button
	class="button is-link is-uppercase has-text-weight-bold {disabled ? 'is-loading' : ''}"
	on:click={modalHandler}>Start exploring</button
>

<div class="modal {showDialog ? 'is-active' : ''}">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div class="modal-background" role="dialog" on:click={modalHandler}></div>
	<div class="modal-content has-background-white p-4">
		<div class="is-flex is-justify-content-space-between is-align-items-flex-end">
			<p>Select a starting point to explore data.</p>
			<button class="delete is-white is-large mb-4" aria-label="close" on:click={modalHandler}
			></button>
		</div>

		{#each dashboardSelections as dbs}
			<button
				class="a-reset a-box p-4 is-flex is-flex-wrap-wrap is-justify-content-space-between is-align-items-center my-4"
				on:click={() => {
					dbs.show = true;
					hideIntro();
				}}
			>
				<img src={dbs.mapIcon} alt={dbs.mapIconAlt} />
				<span class="a-box__text">{dbs.text}</span>
				<i class="fa-solid fa-arrow-right"></i>
			</button>
		{/each}
	</div>
</div>

<style lang="scss">
	.a {
		&-reset {
			all: unset;
		}

		&-box {
			width: 100%;
			box-sizing: border-box;
			border: 1px solid #e1e3e5;
			cursor: pointer;
			transition: all ease 0.3s;

			&:hover {
				border-color: #006eb5;
			}

			&__text {
				width: calc(100% - 80px);
			}
		}
	}
</style>
