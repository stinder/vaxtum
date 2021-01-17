<script>

	export let location;
	export let date;
	export let total_vaccinations;
	export let daily_vaccinations;
	export let total_vaccinations_per_hundred;

	let location_by_name = function(data, name) {
		return data.find(n => n.location===name)
	}

	import { createEventDispatcher, onDestroy } from 'svelte';

	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');

	let modal;

	const handle_keydown = e => {
		if (e.key === 'Escape') {
			close();
			return;
		}

		if (e.key === 'Tab') {
			// trap focus
			const nodes = modal.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement);
			if (index === -1 && e.shiftKey) index = 0;

			index += tabbable.length + (e.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			e.preventDefault();
		}
	};

	const previously_focused = typeof document !== 'undefined' && document.activeElement;

	if (previously_focused) {
		onDestroy(() => {
			previously_focused.focus();
		});
	}
</script>

<svelte:window on:keydown={handle_keydown}/>

<div class="modal-background" on:click={close}></div>

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>

	<div class="details">
		<h2>
			{location}
		</h2>
		<p class="label">Updated on</p> 
		<p class="value">{date.toDateString()}</p>
		<p class="label">Number of vaccinations (single doses)</p> 
		<p class="value">{Number(total_vaccinations).toLocaleString()}</p>
		<p class="label">Daily vaccinations (7-day smoothed)</p>
		<p class="value">{Number(daily_vaccinations).toLocaleString()}	</p>
		<p class="label">Population vaccinated in percent</p> 
		<p class="value">{total_vaccinations_per_hundred}%</p>
	</div>
	<hr>
	<button autofocus on:click={close}>close</button>
</div>

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.5);
	}

	.modal {
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 32em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%,-50%);
		padding: 1em;
		border-radius: 1em;
		display: block;
		background: rgb(171, 209, 223);
	}

	.modal > button {
		background: rgb(138, 170, 180);
	}

	.details > h2 {
		font-family: "Roboto Slab";
		font-size: 3em;
		font-weight: 900;
		text-align: center;
		margin: 0.75em 0 0.75em 0;
	}

	.details > .label {
		font-family: "Roboto";
		font-size: 1em;
		margin-top: 1em;;
	}

	.details > .value {
		font-family: "Roboto Slab";
		font-size: 1.7em;
		font-weight: 400;
	}

	button {
		display: block;
	}
</style>