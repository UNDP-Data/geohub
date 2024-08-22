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

<div class="content">
	<p class="has-text-justified">Welcome to the UNDP Geohub Electricity Access Dashboard!</p>
	<p class="has-text-justified">
		Explore the latest and future trends in electricity access to understand the distribution and
		location of populations at risk of being left behind in more than 100 countries. These datasets
		complement household-derived information on electricity access at the subnational level,
		providing more granular and up-to-date statistics to support electrification plans and
		investments aimed at achieving universal access by 2030 (SDG7).
	</p>
	<p class="has-text-justified has-text-weight-bold">Easy to Use:</p>
	<ul class="has-text-justified">
		<li>Access electricity access estimates at different geographical levels.</li>
		<li>View hyper-granular (1km²) estimates of electricity access from 2012 to 2030.</li>
		<li>Combine maps showing electricity access and other indicators.</li>
	</ul>
</div>

<button
	class="button is-link is-uppercase has-text-weight-bold {disabled ? 'is-loading' : ''}"
	on:click={modalHandler}
	>Start exploring
</button>

<div class="modal {showDialog ? 'is-active' : ''}">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div class="modal-background" role="dialog" on:click={modalHandler}></div>
	<div class="modal-content has-background-white p-4">
		<div class="is-flex is-justify-content-space-between is-align-items-flex-end">
			<p>What do you want to explore?</p>
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
