<script>
	//import 'bulma/css/bulma.css';
	import Papa from "papaparse";
    import Location from "./Location.svelte";
	let showLocationModal = false;
	let location_name;
	
	let showLocation = function(name) {
		location_name = name;
		showLocationModal = true;
	}

	let url = "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv"
	let headlines = [];
	let trends = {};

	let location_by_name = function(data, name) {
		return data.find(n => n.location===name)
	}

	// selects one element from each group
	// key_fn identifies group
	// selector_fn used to compare and select one element to take
	let one_from_group = function(array, key_fn, selector_fn) {
		let selected = {};
		array.forEach(element => {
			let key = key_fn(element);
			selected[key] = key in selected ? selector_fn(element, selected[key]) : element;
		});
		return(Object.values(selected));
	}

	let select_countries = function(elem) {
		let interesting_countries = ["United Kingdom", "Germany", "World"]
		return interesting_countries.includes(elem["location"])
	}

	// maps values linearly between the floor and ceiling
	let rescale = function(values, floor, ceiling) {
	  let min = Math.min(...values);
	  let max = Math.max(...values);
	  return(values.map(v => { return((v-min)/(max-min) * (ceiling-floor) + floor) }));
	}

	Papa.parse(url, {download:true, header: true, complete: function(results) {
		let parsed = results.data.map(row => {
			row.date = new Date(row.date);
			return(row)
		}).filter(row => {
			return(row.location !== '')
		});

		let filtered = parsed.filter(select_countries)

		headlines = one_from_group(
			filtered,
			element => { return(element.location) },
			(a,b) => { return(a.date > b.date ? a : b) }
		);

		filtered.forEach(({location, daily_vaccinations}) => {
			let value = Number(daily_vaccinations);
			trends[location] = location in trends ? trends[location].concat(value) : [value];
		})

		for(var location in trends) {
			trends[location] = rescale(trends[location],0,100);
			if(isNaN(trends[location][0])) {
				trends[location] = [];
			}
		}
	}});
</script>

<section>
	{#each headlines as { location, total_vaccinations, total_vaccinations_per_hundred, state }, i}
	<div class="thing" on:click="{showLocation(location)}">
		<svg>
			<g>
				{#each trends[location] as y, i}
				<rect x='{i*100/trends[location].length}%' y='{100-y}%' width='{100/ trends[location].length}%' height='{y}%'></rect>
				{/each}
			</g>
		</svg>
		<h1>
			{location}
		</h1>
		<h2>
			{Number(total_vaccinations).toLocaleString()}	
		</h2>
	</div>
	{/each}
</section>

<style>
	section {
		position: relative;
	}
	.thing {
		background-color: rgb(118, 173, 194);
		color: white;
		width: 16em;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 1em;
		padding: 1em;
		border-radius: 1em;
		display: block;
		position: relative;
		overflow: hidden;
	}

	.thing > * {
		position: relative;
		color: white;
		font-family: "Roboto", sans-serif;
	}

	.thing > h1 {
		text-transform: uppercase;
		font-size: 1em;
		text-align: left;
	}

	.thing > h2 {
		font-family: "Roboto Slab", serif;
		font-size: 3em;
		font-weight: 900;
		text-align: center;
		margin: 0.75em 0 0.75em 0;
	}

	.thing > h3 {
		font-family: "Roboto Mono", monospace;
		font-size: 1.2em;
		text-align: right;
	}

	.thing > svg {
		position: absolute;
		bottom: 0;
		left: 0;
		display: block;
		width: 100%;
		height: 100%;
	}

	.thing > svg > g > rect {
		position: relative;
		fill:rgb(138, 193, 214);
	}
</style>

{#if showLocationModal}
	<Location {...location_by_name(headlines,location_name)} on:close="{() => showLocationModal = false}">
	</Location>
{/if}
